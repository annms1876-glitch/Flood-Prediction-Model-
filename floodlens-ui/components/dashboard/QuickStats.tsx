export function QuickStats() {
  const stats = [
    { label: "Active Sensors", value: "12", sub: "All online", color: "text-green-400" },
    { label: "Predictions Today", value: "47", sub: "ML ensemble", color: "text-blue-400" },
    { label: "Alerts Sent", value: "8", sub: "3 critical", color: "text-orange-400" },
    { label: "Avg Lead Time", value: "6h", sub: "2-48h range", color: "text-purple-400" },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="card-glass rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
          <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          <p className="text-xs text-gray-500 mt-1">{stat.sub}</p>
        </div>
      ))}
    </div>
  );
}
