export default function AdminPage() {
  return (
    <div className="space-y-6 animate-slide-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
        <p className="text-gray-400 mt-1">
          System configuration and user management
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="card-glass rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-2">
            System Status
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">ML Service</span>
              <span className="text-green-400">● Online</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Backend</span>
              <span className="text-green-400">● Online</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Database</span>
              <span className="text-green-400">● Connected</span>
            </div>
          </div>
        </div>

        <div className="card-glass rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-2">
            Community Members
          </h3>
          <p className="text-2xl font-bold text-white">1,247</p>
          <p className="text-xs text-gray-500">Subscribers receiving alerts</p>
        </div>

        <div className="card-glass rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-2">
            Environment
          </h3>
          <div className="space-y-1 text-xs">
            <p className="text-gray-400">
              Node.js 18+ • Python 3.10+
            </p>
            <p className="text-gray-400">
              Supabase + Firebase
            </p>
            <p className="text-gray-400">
              Docker Compose v3.8
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
