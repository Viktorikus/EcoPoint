"use client"

import { useEffect, useState } from "react"
import AdminSidebar from "@/components/admin/Sidebar"
import { Plus_Jakarta_Sans } from "next/font/google"
import dynamic from "next/dynamic"

const LineChart = dynamic(() => import("recharts").then((mod) => mod.LineChart), { ssr: false })
const BarChart = dynamic(() => import("recharts").then((mod) => mod.BarChart), { ssr: false })
const Bar = dynamic(() => import("recharts").then((mod) => mod.Bar), { ssr: false })
const Line = dynamic(() => import("recharts").then((mod) => mod.Line), { ssr: false })
const XAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis), { ssr: false })
const YAxis = dynamic(() => import("recharts").then((mod) => mod.YAxis), { ssr: false })
const CartesianGrid = dynamic(() => import("recharts").then((mod) => mod.CartesianGrid), { ssr: false })
const Tooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), { ssr: false })
const ResponsiveContainer = dynamic(() => import("recharts").then((mod) => mod.ResponsiveContainer), { ssr: false })

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"] })

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats")
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch (err) {
        console.error("Failed to fetch stats", err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const monthlyData = stats?.monthlyWaste?.map((item: any) => ({
    month: `Bulan ${item.month}`,
    total: item.total
  })) || []

  // Create a simulated distribution for categories or users since we don't have an explicit endpoint for advanced analytics
  const simulatedCategoryData = [
    { name: "Plastik", value: stats?.totalWaste ? Math.round(stats.totalWaste * 0.45) : 0 },
    { name: "Kertas", value: stats?.totalWaste ? Math.round(stats.totalWaste * 0.30) : 0 },
    { name: "Logam", value: stats?.totalWaste ? Math.round(stats.totalWaste * 0.15) : 0 },
    { name: "Kaca", value: stats?.totalWaste ? Math.round(stats.totalWaste * 0.10) : 0 },
  ]

  return (
    <div className={`${jakarta.className} min-h-screen bg-[#F0FDF4] flex`}>
      <AdminSidebar />
      
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Laporan</h1>
          <p className="text-sm text-gray-600 mt-1">Analisis mendalam mengenai performa pengelolaan sampah</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="w-10 h-10 border-4 border-[#16A34A] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">Memuat data analitik...</p>
          </div>
        ) : !stats ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Gagal memuat data</h3>
            <p className="text-gray-500">Terjadi kesalahan saat mengambil data analitik.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="text-sm font-semibold text-gray-500 mb-1">Rata-rata Sampah Harian</div>
                <div className="text-3xl font-bold text-[#16A34A]">
                  {stats?.totalWaste ? Math.round(stats.totalWaste / 30) : 0} <span className="text-lg text-gray-500 font-medium">kg / hari</span>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="text-sm font-semibold text-gray-500 mb-1">Tingkat Konversi Poin</div>
                <div className="text-3xl font-bold text-blue-600">
                  {stats?.totalWaste ? Math.round(stats.totalPoints / stats.totalWaste) : 0} <span className="text-lg text-gray-500 font-medium">poin / kg</span>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="text-sm font-semibold text-gray-500 mb-1">Partisipasi User Aktif</div>
                <div className="text-3xl font-bold text-purple-600">
                  {stats?.totalUsers ? Math.round((stats.recentDeposits?.length || 0) / stats.totalUsers * 100) : 0}% <span className="text-lg text-gray-500 font-medium">minggu ini</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Line Chart */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Tren Setoran Sampah (6 Bulan)</h2>
                {monthlyData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Line type="monotone" dataKey="total" stroke="#16A34A" strokeWidth={3} dot={{r: 4, fill: '#16A34A', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} name="Berat (kg)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center text-gray-400">Tidak ada data tren</div>
                )}
              </div>

              {/* Bar Chart */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Estimasi Distribusi Kategori</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={simulatedCategoryData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                      <Tooltip 
                        cursor={{fill: '#F3F4F6'}}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Estimasi (kg)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
