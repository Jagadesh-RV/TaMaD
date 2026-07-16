import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export default function ProfilePage() {
  const { user, init, loading } = useAuthStore((state) => ({
    user: state.user,
    init: state.init,
    loading: state.loading,
  }));

  useEffect(() => {
    void init();
  }, [init]);

  if (loading || !user) {
    return <div className="p-8 text-gray-600">Loading profile…</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="rounded-[28px] border border-border bg-white p-8 shadow-soft">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-2xl font-semibold text-primary">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#1d1d1f]">{user.name}</h1>
            <p className="mt-2 text-gray-500">{user.email}</p>
            <p className="mt-2 text-sm font-medium text-primary">{user.role?.toUpperCase()}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {[
            ['Account status', 'Active'],
            ['Timezone', user.preferences?.timezone || 'UTC'],
            ['Language', user.preferences?.language || 'en'],
            ['Theme', user.preferences?.theme || 'system'],
          ].map(([title, value]) => (
            <div key={title} className="rounded-2xl border border-border bg-gray-50 p-5">
              <p className="text-sm text-gray-500">{title}</p>
              <p className="mt-2 text-lg font-semibold text-[#1d1d1f]">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}