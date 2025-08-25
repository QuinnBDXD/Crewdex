import 'fake-indexeddb/auto';
import { flushQueue, getQueueLength } from './offlineQueue';

const DB_NAME = 'offline-queue';
const STORE_NAME = 'requests';

async function addRequest(data) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME, {
        keyPath: 'id',
        autoIncrement: true,
      });
    };
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => reject(tx.error);
      tx.objectStore(STORE_NAME).add(data);
    };
    request.onerror = () => reject(request.error);
  });
}

async function getAllRequests() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        resolve(req.result);
        db.close();
      };
      req.onerror = () => reject(req.error);
    };
    request.onerror = () => reject(request.error);
  });
}

beforeEach(async () => {
  await new Promise((resolve) => {
    const req = indexedDB.deleteDatabase(DB_NAME);
    req.onsuccess = req.onerror = req.onblocked = () => resolve();
  });
  jest.resetAllMocks();
});

test('flushQueue removes successful requests', async () => {
  await addRequest({ url: '/test', method: 'POST', headers: {}, body: '{}' });
  global.fetch = jest.fn().mockResolvedValue({ ok: true });
  const eventPromise = new Promise((resolve) => {
    window.addEventListener('offline-queue-update', resolve, { once: true });
  });
  await flushQueue();
  await eventPromise;
  expect(fetch).toHaveBeenCalledWith(
    '/test',
    expect.objectContaining({ method: 'POST' })
  );
  expect(await getQueueLength()).toBe(0);
});

test('flushQueue requeues failed requests with retry metadata', async () => {
  await addRequest({ url: '/fail', method: 'POST', headers: {}, body: '{}' });
  global.fetch = jest
    .fn()
    .mockResolvedValue({ ok: false, status: 500, statusText: 'Error' });
  await flushQueue();
  const requests = await getAllRequests();
  expect(requests).toHaveLength(1);
  expect(requests[0].retryCount).toBe(1);
  expect(typeof requests[0].nextRetryAt).toBe('number');
});
