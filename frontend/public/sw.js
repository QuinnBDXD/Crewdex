/* eslint-env serviceworker */
const API_CACHE = 'api-cache-v1';
const DB_NAME = 'request-queue';
const STORE_NAME = 'requests';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    await self.clients.claim();
    await broadcastQueueLength();
    await flushQueue();
  })());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method === 'GET' && url.pathname.startsWith('/api/')) {
    event.respondWith((async () => {
      const cache = await caches.open(API_CACHE);
      const cached = await cache.match(request);
      const fetchPromise = fetch(request).then((networkResponse) => {
        cache.put(request, networkResponse.clone());
        return networkResponse;
      });
      if (cached) {
        event.waitUntil(fetchPromise.catch(() => {}));
        return cached;
      }
      return fetchPromise;
    })());
    return;
  }

  if ((request.method === 'POST' || request.method === 'PUT') && url.pathname.startsWith('/api/')) {
    event.respondWith((async () => {
      try {
        return await fetch(request.clone());
      } catch (err) {
        console.error('Queuing request due to offline mode', err);
        await enqueueRequest(request.clone());
        await broadcastQueueLength();
        return new Response(JSON.stringify({ queued: true }), {
          status: 202,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    })());
  }
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'FLUSH_QUEUE') {
    event.waitUntil(flushQueue());
  }
  if (event.data?.type === 'GET_QUEUE_LENGTH') {
    event.waitUntil(broadcastQueueLength());
  }
});

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (event) => {
      event.target.result.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function enqueueRequest(request) {
  const db = await openDB();
  const body = await request.text();
  const headers = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).add({
      method: request.method,
      url: request.url,
      headers,
      body,
      createdAt: Date.now(),
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getAllRequests() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function deleteRequest(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function flushQueue() {
  const requests = await getAllRequests();
  for (const item of requests) {
    try {
      await fetch(item.url, {
        method: item.method,
        headers: item.headers,
        body: item.body,
      });
      await deleteRequest(item.id);
    } catch (err) {
      console.error('Failed to replay request', err);
      // keep request for retry
    }
  }
  await broadcastQueueLength();
}

async function getQueueLength() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.count();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function broadcastQueueLength() {
  const length = await getQueueLength();
  const clientList = await self.clients.matchAll();
  clientList.forEach((client) => client.postMessage({ type: 'QUEUE_LENGTH', length }));
}
