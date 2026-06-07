"use client"

import { useEffect, useState } from "react"
import PetugasSidebar from "@/components/petugas/Sidebar"
import { Plus_Jakarta_Sans } from "next/font/google"

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"] })

export default function PetugasVerifyPage() {
  const [deposits, setDeposits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<number | null>(null)
  const [filter, setFilter] = useState("PENDING")

  useEffect(() => {
    fetchDeposits()
  }, [])

  async function fetchDeposits() {
    setLoading(true)
    try {
      const res = await fetch("/api/petugas/deposits")
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setDeposits(data.data || [])
    } catch (err) {
      console.error(err)
      setDeposits([])
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify(id: number, status: 'VERIFIED' | 'REJECTED') {
    if (!confirm(`Anda yakin ingin ${status === 'VERIFIED' ? 'verifikasi' : 'tolak'} setoran ini?`)) return
    
    setProcessingId(id)
    try {
      const res = await fetch(`/api/petugas/deposits/${id}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      })

      if (!res.ok) throw new Error("Failed to process")

      setDeposits(prev => prev.map(d => d.id === id ? { ...d, status } : d))
    } catch (err) {
      console.error(err)
      alert("Terjadi kesalahan saat memproses setoran.")
    } finally {
      setProcessingId(null)
    }
  }

  const filteredDeposits = deposits.filter(d => filter === "ALL" ? true : d.status === filter)

  return (
    <div className={`${jakarta.className} min-h-screen bg-[#F0FDF4] flex`}>
      <PetugasSidebar />
      <main className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Verifikasi Setoran</h1>
          <p className="text-sm text-gray-600 mt-1">Periksa dan verifikasi setoran sampah dari user</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 mb-6 flex gap-2">
          {["PENDING", "VERIFIED", "REJECTED", "ALL"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-[#16A34A] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f === "ALL" ? "Semua" : f}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-[#16A34A] text-white">
                  <th className="px-6 py-4 font-semibold whitespace-nowrap">Tanggal</th>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap">User</th>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap">Kategori</th>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap">Berat & Poin</th>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap">Foto</th>
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
                ) : filteredDeposits.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-6xl mb-4">📭</div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Tidak ada data</h3>
                      <p className="text-gray-500">Belum ada setoran dengan status {filter}.</p>
                    </td>
                  </tr>
                ) : (
                  filteredDeposits.map((deposit) => (
                    <tr key={deposit.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap align-middle">
                        {new Date(deposit.created_at).toLocaleDateString("id-ID", {
                          year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                        })}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 align-middle">{deposit.user_name}</td>
                      <td className="px-6 py-4 text-gray-700 align-middle">{deposit.category_name}</td>
                      <td className="px-6 py-4 align-middle">
                        <div className="font-semibold text-gray-900">{deposit.weight} kg</div>
                        <div className="text-xs font-bold text-green-600">+{deposit.point} Poin</div>
                      </td>
                      <td className="px-6 py-4 align-middle">
                        {deposit.photo ? (
                          <a href={deposit.photo} target="_blank" rel="noopener noreferrer" className="block relative w-16 h-16 rounded border border-gray-200 overflow-hidden hover:opacity-80 transition-opacity">
                            <img src={deposit.photo} alt="Setoran" className="object-cover w-full h-full" />
                          </a>
                        ) : (
                          <span className="text-gray-400 italic text-xs">No photo</span>
                        )}
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            deposit.status === "VERIFIED" ? "bg-green-100 text-green-800" :
                            deposit.status === "REJECTED" ? "bg-red-100 text-red-800" :
                            "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {deposit.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-middle">
                        {deposit.status === "PENDING" ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleVerify(deposit.id, "VERIFIED")}
                              disabled={processingId === deposit.id}
                              className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1.5 rounded text-xs font-bold transition-colors disabled:opacity-50"
                            >
                              Verifikasi
                            </button>
                            <button
                              onClick={() => handleVerify(deposit.id, "REJECTED")}
                              disabled={processingId === deposit.id}
                              className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded text-xs font-bold transition-colors disabled:opacity-50"
                            >
                              Tolak
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs italic">Diproses</span>
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
