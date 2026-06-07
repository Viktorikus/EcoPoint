import AdminSidebar from "@/components/admin/Sidebar"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Plus_Jakarta_Sans } from "next/font/google"
import DashboardChart from "@/components/admin/DashboardChart"

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "600", "700"] })

async function getStats() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
    const res = await fetch(`${baseUrl}/api/admin/stats`, {
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    })
    if (!res.ok) return null
    return res.json()
  } catch (err) {
    console.error("Failed to fetch stats:", err)
    return null
  }
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'ADMIN') {
    redirect('/auth/login')
  }

  const stats = await getStats()

  const today = new Date()
  const formattedDate = today.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const StatCard = ({ label, value, icon, color }: any) => (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 font-medium mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value.toLocaleString("id-ID")}</p>
        </div>
        <div className={`text-4xl ${color}`}>{icon}</div>
      </div>
    </div>
  )

  return (
    <div className={`${jakarta.className} min-h-screen bg-[#F0FDF4] flex`}>
      <AdminSidebar />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
          <p className="text-sm text-gray-600 mt-1">{formattedDate}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            label="Total Users"
            value={stats?.totalUsers || 0}
            icon="👥"
            color="text-blue-500"
          />
          <StatCard
            label="Total Sampah (kg)"
            value={stats?.totalWaste || 0}
            icon="♻️"
            color="text-green-500"
          />
          <StatCard
            label="Total Laporan"
            value={stats?.totalReports || 0}
            icon="📋"
            color="text-yellow-500"
          />
          <StatCard
            label="Total Poin Terdistribusi"
            value={stats?.totalPoints || 0}
            icon="💰"
            color="text-purple-500"
          />
        </div>

        {/* Chart & Table Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Chart */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Sampah per Bulan (6 Bulan Terakhir)</h2>
            <DashboardChart data={stats?.monthlyWaste || []} />
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Ringkasan Cepat</h2>
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-600 font-medium">Users Aktif</p>
                <p className="text-2xl font-bold text-blue-700">{stats?.totalUsers || 0}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-green-600 font-medium">Sampah Terverifikasi</p>
                <p className="text-2xl font-bold text-green-700">{stats?.totalWaste || 0} kg</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-xs text-yellow-600 font-medium">Total Laporan</p>
                <p className="text-2xl font-bold text-yellow-700">{stats?.totalReports || 0}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-purple-600 font-medium">Poin Terdistribusi</p>
                <p className="text-2xl font-bold text-purple-700">{stats?.totalPoints || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Deposits Table */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">5 Setoran Terbaru</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Nama User</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Kategori</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Berat (kg)</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Poin</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentDeposits && stats.recentDeposits.length > 0 ? (
                  stats.recentDeposits.map((deposit: any) => (
                    <tr key={deposit.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-900 font-medium">{deposit.user_name}</td>
                      <td className="px-6 py-4 text-gray-700">{deposit.category_name}</td>
                      <td className="px-6 py-4 text-gray-700">{deposit.weight}</td>
                      <td className="px-6 py-4 text-green-700 font-semibold">{deposit.point}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            deposit.status === "VERIFIED"
                              ? "bg-green-100 text-green-800"
                              : deposit.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {deposit.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-xs">
                        {new Date(deposit.created_at).toLocaleDateString("id-ID")}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-600">
                      Belum ada setoran
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
