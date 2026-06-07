"use client"

import { useEffect, useState } from "react"
import AdminSidebar from "@/components/admin/Sidebar"
import { Plus_Jakarta_Sans } from "next/font/google"

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"] })

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  useEffect(() => {
    fetchReports()
  }, [])

  async function fetchReports() {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/reports")
      if (!res.ok) throw new Error("Failed to fetch reports")

      const data = await res.json()
      setReports(data.data || [])
    } catch (err) {
      console.error("Fetch reports error:", err)
      setReports([])
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(reportId: number, newStatus: string) {
    if (!confirm(`Ubah status menjadi ${newStatus}?`)) return
    
    setUpdatingId(reportId)
    try {
      const res = await fetch(`/api/admin/reports/${reportId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) throw new Error("Failed to update status")

      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId ? { ...r, status: newStatus } : r
        )
      )
    } catch (err) {
      console.error("Update status error:", err)
      alert("Gagal mengubah status laporan")
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className={`${jakarta.className} min-h-screen bg-[#F0FDF4] flex`}>
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Laporan</h1>
          <p className="text-sm text-gray-600 mt-1">Kelola laporan penumpukan sampah liar dari user</p>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-[#16A34A] text-white">
                  <th className="px-6 py-4 font-semibold whitespace-nowrap">Tanggal</th>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap">Pelapor</th>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap">Foto</th>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap">Lokasi & Deskripsi</th>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-8 h-8 border-4 border-[#16A34A] border-t-transparent rounded-full animate-spin mb-4"></div>
                        <span className="text-gray-500">Memuat data...</span>
                      </div>
                    </td>
                  </tr>
                ) : reports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-6xl mb-4">📭</div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Belum ada laporan</h3>
                      <p className="text-gray-500">Data laporan sampah dari user akan muncul di sini.</p>
                    </td>
                  </tr>
                ) : (
                  reports.map((report) => (
                    <tr key={report.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap align-top">
                        {new Date(report.created_at).toLocaleDateString("id-ID", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="font-medium text-gray-900">{report.user_name}</div>
                        <div className="text-xs text-gray-500">{report.user_email}</div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        {report.photo ? (
                          <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                            <img src={report.photo} alt="Foto Laporan" className="object-cover w-full h-full" />
                          </div>
                        ) : (
                          <span className="text-gray-400 italic text-xs">No photo</span>
                        )}
                      </td>
                      <td className="px-6 py-4 align-top max-w-xs">
                        <div className="font-medium text-gray-800 mb-1 line-clamp-2">{report.location}</div>
                        <div className="text-gray-600 line-clamp-3">{report.description}</div>
                        {(report.latitude && report.longitude) && (
                          <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${report.latitude},${report.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-3 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-2 py-1 rounded"
                          >
                            📍 Lihat di Peta
                          </a>
                        )}
                      </td>
                      <td className="px-6 py-4 align-top">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            report.status === "COMPLETED"
                              ? "bg-green-100 text-green-800"
                              : report.status === "ON_PROGRESS"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <select
                          value={report.status}
                          onChange={(e) => updateStatus(report.id, e.target.value)}
                          disabled={updatingId === report.id}
                          className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[#16A34A] focus:border-[#16A34A] block w-full p-2 disabled:opacity-50 cursor-pointer"
                        >
                          <option value="REPORTED">REPORTED</option>
                          <option value="ON_PROGRESS">ON PROGRESS</option>
                          <option value="COMPLETED">COMPLETED</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
