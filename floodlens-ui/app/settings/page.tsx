export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-slide-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">
          Configure your FloodLens preferences
        </p>
      </div>

      <div className="card-glass rounded-xl p-6 max-w-lg">
        <h2 className="text-lg font-semibold text-white mb-4">
          API Configuration
        </h2>
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm text-gray-400">ML Service URL</label>
            <input
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-brand-accent/50"
              defaultValue="http://localhost:8000"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-400">Backend URL</label>
            <input
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-brand-accent/50"
              defaultValue="http://localhost:3000"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-400">Refresh Interval (ms)</label>
            <input
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-brand-accent/50"
              defaultValue="30000"
              type="number"
            />
          </div>
        </div>
        <button className="mt-4 bg-brand-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-accent/80">
          Save Settings
        </button>
      </div>
    </div>
  );
}
