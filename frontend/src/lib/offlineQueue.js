import { useEffect, useState } from 'react';

const DB_NAME = 'offline-queue';
const STORE_NAME = 'requests';
const MAX_RETRIES = 5;

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME, {
        keyPath: 'id',
        autoIncrement: true,
      });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getAllRequests(db) {
  const database = db || (await openDb());
  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => {
      resolve(req.result);
      if (!db) database.close();
    };
    req.onerror = () => {
      reject(req.error);
      if (!db) database.close();
    };
  });
}

export async function flushQueue() {
  let db;
  try {
    db = await openDb();
    const requests = await getAllRequests(db);
    for (const item of requests) {
      // Skip requests that are waiting for their next retry window
      if (item.nextRetryAt && Date.now() < item.nextRetryAt) {
        continue;
      }
      try {
        const response = await fetch(item.url, {
          method: item.method,
          headers: item.headers,
          body: item.body,
          credentials: 'include',
        });
        if (!response.ok) {
          console.error('Request failed', {
            url: item.url,
            status: response.status,
            statusText: response.statusText,
          });
          throw new Error(`Request failed with status ${response.status}`);
        }
        await new Promise((resolve, reject) => {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          tx.oncomplete = resolve;
          tx.onerror = () => reject(tx.error);
          tx.objectStore(STORE_NAME).delete(item.id);
        });
      } catch (err) {
        console.error('Re-queuing request after failure', err);
        item.retryCount = (item.retryCount || 0) + 1;

        if (item.retryCount >= MAX_RETRIES) {
          console.error('Max retries exceeded, dropping request', item);
          await new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            tx.oncomplete = resolve;
            tx.onerror = () => reject(tx.error);
            tx.objectStore(STORE_NAME).delete(item.id);
          });
          continue;
        }

        const delaySeconds = 2 ** item.retryCount;
        // Store next retry timestamp to implement exponential backoff
        item.nextRetryAt = Date.now() + delaySeconds * 1000;
        await new Promise((resolve, reject) => {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          tx.oncomplete = resolve;
          tx.onerror = () => reject(tx.error);
          tx.objectStore(STORE_NAME).put(item);
        });
      }
    }
  } catch (err) {
    console.error('Failed to flush offline queue', err);
  } finally {
    if (db) db.close();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('offline-queue-update'));
    }
  }
}

export function initOfflineQueue() {
  if (typeof window !== 'undefined') {
    window.addEventListener('online', flushQueue);
    if (navigator.onLine) {
      flushQueue();
    }
  }
}

export async function getQueueLength() {
  const requests = await getAllRequests();
  return requests.length;
}

export function useOfflineQueue() {
  const [online, setOnline] = useState(navigator.onLine);
  const [queued, setQueued] = useState(0);

  useEffect(() => {
    async function update() {
      setOnline(navigator.onLine);
      setQueued(await getQueueLength());
    }
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    window.addEventListener('offline-queue-update', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
      window.removeEventListener('offline-queue-update', update);
    };
  }, []);

  return { online, queued };
}
