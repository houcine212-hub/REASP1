import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle } from 'lucide-react';
import { onSyncStatusChange, getPendingQueue, flushQueue } from '../services/syncService';

const bannerBase = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '10px clamp(16px, 5vw, 32px)',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontFamily: '"Share Tech Mono", monospace',
  fontSize: 'clamp(11px, 3vw, 13px)',
  letterSpacing: '0.5px',
  transition: 'background 0.3s ease, opacity 0.3s ease',
  zIndex: 100,
};

const variants = {
  offline: {
    background: '#1a1a1a',
    color: '#ff6b6b',
    borderBottom: '1px solid #333',
  },
  syncing: {
    background: '#1a1a1a',
    color: '#ffd166',
    borderBottom: '1px solid #333',
  },
  synced: {
    background: '#1a1a1a',
    color: '#06d6a0',
    borderBottom: '1px solid #333',
  },
};

const spinStyle = {
  animation: 'spin 1s linear infinite',
};

// Inject keyframes once
if (typeof document !== 'undefined' && !document.getElementById('sync-spin')) {
  const style = document.createElement('style');
  style.id = 'sync-spin';
  style.textContent = '@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }';
  document.head.appendChild(style);
}

const retryBtnStyle = {
  marginLeft: 'auto',
  background: 'transparent',
  border: '1px solid currentColor',
  borderRadius: '20px',
  color: 'inherit',
  fontFamily: '"Share Tech Mono", monospace',
  fontSize: 'clamp(10px, 2.8vw, 12px)',
  padding: '4px 12px',
  cursor: 'pointer',
  letterSpacing: '1px',
  opacity: 0.85,
};

export default function OfflineBanner() {
  const [status, setStatus] = useState(() => ({
    online: navigator.onLine,
    syncing: false,
    pending: getPendingQueue().length,
    synced: 0,
  }));

  const [visible, setVisible] = useState(!navigator.onLine || getPendingQueue().length > 0);

  useEffect(() => {
    const unsub = onSyncStatusChange((s) => {
      setStatus(prev => ({ ...prev, ...s }));
      setVisible(true);

      if (s.online && !s.syncing && s.pending === 0) {
        setTimeout(() => setVisible(false), 3000);
      }
    });
    return unsub;
  }, []);

  if (!visible) return null;

  const variant = !status.online
    ? 'offline'
    : status.syncing
    ? 'syncing'
    : 'synced';

  const Icon = !status.online
    ? WifiOff
    : status.syncing
    ? RefreshCw
    : CheckCircle;

  const message = !status.online
    ? `Offline — ${status.pending} update${status.pending !== 1 ? 's' : ''} queued locally`
    : status.syncing
    ? `Syncing… (${status.pending} remaining)`
    : 'All changes synced ✓';

  const handleRetry = () => {
    flushQueue((done, total) => {
      setStatus(prev => ({ ...prev, syncing: true, synced: done, pending: total - done }));
    }).then(() => {
      setStatus(prev => ({ ...prev, syncing: false, pending: getPendingQueue().length }));
      if (getPendingQueue().length === 0) setTimeout(() => setVisible(false), 3000);
    });
  };

  return (
    <div style={{ ...bannerBase, ...variants[variant] }}>
      <Icon
        size={15}
        style={status.syncing ? spinStyle : undefined}
      />
      <span>{message}</span>

      {!status.online && status.pending > 0 && (
        <button style={retryBtnStyle} onClick={handleRetry}>
          retry
        </button>
      )}
    </div>
  );
}
