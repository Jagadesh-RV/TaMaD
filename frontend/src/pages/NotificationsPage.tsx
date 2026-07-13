import { useEffect, useState } from 'react';

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const mockNotifications = [
      {
        id: 1,
        message: 'Task deadline approaching',
        type: 'warning'
      },
      {
        id: 2,
        message: 'New roadmap milestone completed',
        type: 'success'
      },
      {
        id: 3,
        message: 'Focus session started',
        type: 'info'
      }
    ];

    setNotifications(mockNotifications);
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Notifications</h1>
          <p className="text-slate-400 mt-2 max-w-xl">Stay on top of everything with polished updates, alerts, and action prompts delivered in one elegant feed.</p>
        </div>
        <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
          <div className="card p-4 bg-slate-900/80 border border-white/10">
            <div className="text-xs uppercase text-slate-500">Total</div>
            <div className="text-2xl font-semibold text-white">{notifications.length}</div>
          </div>
          <div className="card p-4 bg-brand-950/80 border border-brand-500/20">
            <div className="text-xs uppercase text-slate-500">Active</div>
            <div className="text-2xl font-semibold text-brand-300">{notifications.filter(n => n.type !== 'info').length}</div>
          </div>
          <div className="card p-4 bg-slate-900/80 border border-slate-700/50">
            <div className="text-xs uppercase text-slate-500">Recent</div>
            <div className="text-2xl font-semibold text-emerald-300">Today</div>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="card p-5 bg-slate-950/80 border border-white/10 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-white">{notification.message}</p>
                <p className="text-sm text-slate-400 mt-1">Delivered {notification.id === 1 ? '2 min ago' : notification.id === 2 ? '1 hr ago' : '15 min ago'}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${notification.type === 'success' ? 'bg-emerald-500/15 text-emerald-300' : notification.type === 'warning' ? 'bg-amber-500/15 text-amber-300' : 'bg-sky-500/15 text-sky-300'}`}>
                {notification.type}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NotificationsPage;