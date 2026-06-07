"use client"

import { useEffect, useState } from "react"
import PetugasSidebar from "@/components/petugas/Sidebar"
import { Plus_Jakarta_Sans } from "next/font/google"
import Link from "next/link"

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"] })

export default function PetugasDashboard() {
  const [stats, setStats] = useState({
    pendingDeposits: 0,
    waitingPickups: 0,
    scheduledPickups: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const [depositsRes, pickupsRes] = await Promise.all([
          fetch("/api/petugas/deposits"),
          fetch("/api/petugas/pickup")
        ])
        
        const depositsData = await depositsRes.json()
        const pickupsData = await pickupsRes.json()

        const pendingDeposits = (depositsData.data || []).filter((d: any) => d.status === "PENDING").length
        const waitingPickups = (pickupsData.data || []).filter((p: any) => p.status === "WAITING").length
        const scheduledPickups = (pickupsData.data || []).filter((p: any) => p.status === "SCHEDULED").length

        setStats({ pendingDeposits, waitingPickups, scheduledPickups })
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const today = new Date()
  const formattedDate = today.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className={`${jakarta.className} min-h-screen bg-[#F0FDF4] flex`}>
      <PetugasSidebar />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Petugas</h1>
          <p className="text-sm text-gray-600 mt-1">{formattedDate}</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 h-32 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#16A34A] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Setoran Menunggu Verifikasi */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-l-4 border-l-yellow-400 border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">Setoran Menunggu Verifikasi</p>
                  <p className="text-4xl font-bold text-gray-900">{stats.pendingDeposits}</p>
                </div>
                <div className="text-4xl text-yellow-500">📦</div>
              </div>
            </div>

            {/* Penjemputan Hari Ini */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-l-4 border-l-blue-500 border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">Penjemputan Menunggu (Waiting)</p>
                  <p className="text-4xl font-bold text-gray-900">{stats.waitingPickups}</p>
                </div>
                <div className="text-4xl text-blue-500">🚗</div>
              </div>
            </div>

            {/* Dijadwalkan */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-l-4 border-l-green-500 border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">Penjemputan Terjadwal (Scheduled)</p>
                  <p className="text-4xl font-bold text-gray-900">{stats.scheduledPickups}</p>
                </div>
                <div className="text-4xl text-green-500">📅</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/petugas/verify" className="bg-[#16A34A] hover:bg-[#15803D] text-white rounded-xl shadow-md p-6 flex items-center justify-between transition-transform transform hover:-translate-y-1">
            <div>
              <h3 className="text-xl font-bold mb-1">Verifikasi Setoran</h3>
              <p className="text-green-100 text-sm">Cek dan validasi berat sampah dari user</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5l10 -10"></path></svg>
            </div>
          </Link>
          
          <Link href="/petugas/pickup" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md p-6 flex items-center justify-between transition-transform transform hover:-translate-y-1">
            <div>
              <h3 className="text-xl font-bold mb-1">Kelola Penjemputan</h3>
              <p className="text-blue-100 text-sm">Update status request pickup sampah user</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l14 0"></path><path d="M13 18l6 -6"></path><path d="M13 6l6 6"></path></svg>
            </div>
          </Link>
        </div>
      </main>
    </div>
  )
}
