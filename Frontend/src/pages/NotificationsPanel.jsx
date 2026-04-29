import { useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { api } from '../utils/api.js';

export default function NotificationsPanel({ open, onClose }) {
  const { notifications, setNotifications, unreadCount, setUnreadCount, config } = useApp();

  useEffect(() => {
    const load = async () => {
      if (!config) return;
      const response = await api.get('/notifications');
      if (response.data.success) {
        setNotifications(response.data.data.items);
        setUnreadCount(response.data.data.unread);
      }
    };
    load();
  }, [config]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed right-0 top-20 z-50 h-full w-full max-w-md transform translate-x-0 transition">
      <div className="h-full bg-surface2 p-5 shadow-card">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-white">Notification Center</p>
            <p className="text-sm text-muted">{unreadCount} unread</p>
          </div>
          <button onClick={onClose} className="text-white">Close</button>
        </div>
        <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-140px)]">
          {notifications?.length ? notifications.map((item) => (
            <div key={item._id} className={`rounded-2xl border border-border p-4 ${item.read ? 'bg-surface' : 'bg-surface2'}`}>
              <p className="text-sm font-semibold text-white">{item.title}</p>
              <p className="mt-1 text-sm text-muted">{item.message}</p>
              <p className="mt-2 text-xs text-muted">{new Date(item.createdAt).toLocaleString()}</p>
            </div>
          )) : <p className="text-muted">No notifications yet</p>}
        </div>
      </div>
    </div>
  );
}
