const DB_NAME = 'offline-queue';
const STORE_NAME = 'requests';

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function queueRequest(data) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(STORE_NAME).add(data);
  });
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method === 'POST' || req.method === 'PUT') {
    event.respondWith(
      fetch(req.clone()).catch(async () => {
        const headers = {};
        req.headers.forEach((value, key) => (headers[key] = value));
        const body = await req.clone().text();
        await queueRequest({
          method: req.method,
          url: req.url,
          headers,
          body,
          createdAt: Date.now(),
          retryCount: 0,
        });
        return new Response(
          JSON.stringify({ error: 'offline', queued: true }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          },
        );
      }),
    );
  }
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
