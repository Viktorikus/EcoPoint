"use client"

import { useEffect, useState } from "react"
import PetugasSidebar from "@/components/petugas/Sidebar"
import { Plus_Jakarta_Sans } from "next/font/google"

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"] })

export default function PetugasPickupPage() {
  const [pickups, setPickups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("Semua")
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  useEffect(() => {
    fetchPickups()
  }, [filter])

  async function fetchPickups() {
    setLoading(true)
    try {
      const url = filter === "Semua" ? "/api/petugas/pickup" : `/api/petugas/pickup?status=${filter}`
      const res = await fetch(url)
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setPickups(data.data || [])
    } catch (err) {
      console.error(err)
      setPickups([])
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id: number, newStatus: string) {
    if (!confirm(`Ubah status menjadi ${newStatus}?`)) return
    
    setUpdatingId(id)
    try {
      const res = await fetch(`/api/petugas/pickup/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })

      if (!res.ok) throw new Error("Failed to update status")

      setPickups(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p))
    } catch (err) {
      console.error(err)
      alert("Gagal mengubah status penjemputan")
    } finally {
      setUpdatingId(null)
    }
  }

  const statusColors: Record<string, string> = {
    WAITING: "bg-gray-100 text-gray-600",
    SCHEDULED: "bg-blue-100 text-blue-700",
    ON_THE_WAY: "bg-yellow-100 text-yellow-700",
    DONE: "bg-green-100 text-green-700"
  }

  return (
    <div className={`${jakarta.className} min-h-screen bg-[#F0FDF4] flex`}>
      <PetugasSidebar />
      <main className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Penjemputan Sampah</h1>
          <p className="text-sm text-gray-600 mt-1">Kelola jadwal penjemputan (pickup) ke lokasi user</p>
        </div>

        {/* Tab Filter */}
        <div className="bg-white rounded-lg shadow-sm p-2 border border-gray-200 mb-6 flex flex-wrap gap-2">
          {["Semua", "WAITING", "SCHEDULED", "ON_THE_WAY", "DONE"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-[#16A34A] text-white"
                  : "bg-transparent text-gray-600 hover:bg-gray-100"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-[#16A34A] text-white">
                  <th className="px-6 py-4 font-semibold whitespace-nowrap">Nama User</th>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap">No HP</th>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap">Alamat Penjemputan</th>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap">Jadwal</th>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap">Catatan</th>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-8 h-8 border-4 border-[#16A34A] border-t-transparent rounded-full animate-spin mb-4"></div>
                        <span className="text-gray-500">Memuat data...</span>
                      </div>
                    </td>
                  </tr>
                ) : pickups.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-6xl mb-4">📭</div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Tidak ada data</h3>
                      <p className="text-gray-500">Belum ada request penjemputan untuk filter ini.</p>
                    </td>
                  </tr>
                ) : (
                  pickups.map((pickup) => (
                    <tr key={pickup.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900 align-top">{pickup.user_name}</td>
                      <td className="px-6 py-4 text-gray-700 align-top">{pickup.user_phone}</td>
                      <td className="px-6 py-4 text-gray-700 align-top max-w-xs">{pickup.address}</td>
                      <td className="px-6 py-4 text-gray-900 font-medium align-top">
                        {new Date(pickup.scheduled_at).toLocaleDateString("id-ID", {
                          weekday: "long", year: "numeric", month: "short", day: "numeric"
                        })}
                      </td>
                      <td className="px-6 py-4 text-gray-600 align-top max-w-xs">{pickup.notes || "-"}</td>
                      <td className="px-6 py-4 align-top">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[pickup.status] || "bg-gray-100 text-gray-800"}`}>
                          {pickup.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-top">
                        {pickup.status === "DONE" ? (
                          <span className="text-green-600 font-semibold px-2">Selesai</span>
                        ) : (
                          <select
                            value={pickup.status}
                            onChange={(e) => updateStatus(pickup.id, e.target.value)}
                            disabled={updatingId === pickup.id}
                            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[#16A34A] focus:border-[#16A34A] block w-full p-2 cursor-pointer disabled:opacity-50"
                          >
                            <option value="WAITING" disabled={pickup.status !== "WAITING"}>WAITING</option>
                            <option value="SCHEDULED" disabled={pickup.status !== "WAITING" && pickup.status !== "SCHEDULED"}>SCHEDULED</option>
                            <option value="ON_THE_WAY" disabled={pickup.status !== "SCHEDULED" && pickup.status !== "ON_THE_WAY"}>ON_THE_WAY</option>
                            <option value="DONE" disabled={pickup.status !== "ON_THE_WAY" && pickup.status !== "DONE"}>DONE</option>
                          </select>
                        )}
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
