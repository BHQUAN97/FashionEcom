/**
 * Admin Dashboard — KPI cards + charts
 */
export default function AdminDashboard() {
  const kpis = [
    { label: 'Doanh thu hom nay', value: '12.500.000d', change: '+15%' },
    { label: 'Doanh thu thang', value: '385.000.000d', change: '+8%' },
    { label: 'Tong don hang', value: '142', change: '+12%' },
    { label: 'Khach hang moi', value: '28', change: '+5%' },
    { label: 'Don TB (AOV)', value: '850.000d', change: '-2%' },
    { label: 'Ton kho canh bao', value: '7', change: '' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-lg border p-4">
            <p className="text-xs text-gray-500 mb-1">{kpi.label}</p>
            <p className="text-lg font-bold">{kpi.value}</p>
            {kpi.change && (
              <p className={`text-xs mt-1 ${kpi.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {kpi.change} so voi ky truoc
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Chart placeholders */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-6 h-72 flex items-center justify-center text-gray-400">
          Bieu do doanh thu (Recharts — Phase 2)
        </div>
        <div className="bg-white rounded-lg border p-6 h-72 flex items-center justify-center text-gray-400">
          Bieu do don hang theo trang thai (Recharts — Phase 2)
        </div>
      </div>
    </div>
  );
}
