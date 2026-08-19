import { useEffect, useState } from 'react';
import { TbBell } from 'react-icons/tb';
import { apiFetch } from '../lib/api';

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export function NotificationsBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  function fetchNotifications() {
    apiFetch<{ notifications: Notification[]; unreadCount: number }>('/notifications?limit=15').then((data) => {
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    });
  }

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  async function markAsRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await apiFetch(`/notifications/${id}/read`, { method: 'PATCH' });
    } catch {
      fetchNotifications();
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Notiser"
        className="relative rounded-lg bg-transparent p-2 text-muted hover:bg-primary-light hover:text-text"
      >
        <TbBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 max-h-96 w-80 overflow-y-auto rounded-lg border border-border bg-surface shadow-lg">
            {notifications.length === 0 ? (
              <p className="p-4 text-center text-sm text-muted">Inga notiser</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => markAsRead(n.id)}
                  className={`block w-full border-b border-border px-3 py-2.5 text-left last:border-0 hover:bg-primary-light ${
                    n.read ? 'bg-transparent' : 'bg-primary-light'
                  }`}
                >
                  <div className="text-xs font-semibold text-text">{n.title}</div>
                  <div className="mt-0.5 text-xs text-muted">{n.message}</div>
                  <div className="mt-1 text-[11px] text-muted">{new Date(n.createdAt).toLocaleString('sv-SE')}</div>
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
