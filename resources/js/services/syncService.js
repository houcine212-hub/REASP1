import { updateArticle } from './api';

const QUEUE_KEY = 'pending_article_updates';

export function getPendingQueue() {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveQueue(queue) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}


export function queueUpdate(articleId, data) {
  const queue = getPendingQueue();
  const idx = queue.findIndex(item => item.id === articleId);
  const entry = { id: articleId, data, queuedAt: Date.now() };

  if (idx >= 0) {
    queue[idx] = entry;
  } else {
    queue.push(entry);
  }

  saveQueue(queue);
}

function removeFromQueue(articleId) {
  const queue = getPendingQueue().filter(item => item.id !== articleId);
  saveQueue(queue);
}



let isSyncing = false;
export async function flushQueue(onProgress) {
  if (isSyncing) return;
  isSyncing = true;

  const queue = getPendingQueue();
  if (queue.length === 0) {
    isSyncing = false;
    return;
  }

  let successCount = 0;

  for (const item of queue) {
    try {
      await updateArticle(item.id, item.data);
      removeFromQueue(item.id);
      successCount++;
      onProgress?.(successCount, queue.length);
    } catch (err) {
      console.warn(`[sync] Failed to sync article ${item.id}:`, err);
    }
  }

  isSyncing = false;
}


let listeners = [];

export function onSyncStatusChange(cb) {
  listeners.push(cb);
  return () => { listeners = listeners.filter(l => l !== cb); };  
}

function notify(status) {
  listeners.forEach(cb => cb(status));
}


export function initSyncService() {
  const handleOnline = async () => {
    notify({ online: true, syncing: true, pending: getPendingQueue().length });
    await flushQueue((done, total) => {
      notify({ online: true, syncing: true, synced: done, pending: total - done });
    });
    notify({ online: true, syncing: false, pending: getPendingQueue().length });
  };

  const handleOffline = () => {
    notify({ online: false, syncing: false, pending: getPendingQueue().length });
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}


export function setCache(key, data) {
  try {
    localStorage.setItem('cache_' + key, JSON.stringify({ data, ts: Date.now() }));
  } catch {}
}

export function getCache(key) {
  try {
    const raw = localStorage.getItem('cache_' + key);
    return raw ? JSON.parse(raw).data : null;
  } catch { return null; }
}