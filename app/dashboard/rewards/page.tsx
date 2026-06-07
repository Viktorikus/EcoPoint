"use client"

import React, { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Plus_Jakarta_Sans } from "next/font/google"
import Link from "next/link"
import UserSidebar from "@/components/user/Sidebar"

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "600"] })

type Reward = {
  id: number | string
  name: string
  description?: string
  point_required: number
  stock: number
  category?: string
}

export default function RewardsPage() {
  const { data: session } = useSession()
  const [points, setPoints] = useState<number | null>(null)
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<Reward | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchRewards()
    fetchStats()
  }, [])

  async function fetchRewards() {
    setLoading(true)
    try {
      const res = await fetch('/api/rewards')
      if (!res.ok) throw new Error('Gagal memuat rewards')
      const data = await res.json()
      setRewards(data || [])
    } catch (e) {
      setRewards([])
    } finally {
      setLoading(false)
    }
  }

  async function fetchStats() {
    try {
      const res = await fetch('/api/user/stats')
      if (!res.ok) return
      const data = await res.json()
      setPoints(data.points ?? 0)
    } catch (e) {
      // ignore
    }
  }

  function iconFor(reward: Reward) {
    const name = (reward.name || '').toLowerCase()
    if (name.includes('pulsa')) return '📱'
    if (name.includes('voucher')) return '🎫'
    if (name.includes('merch') || name.includes('merchandise')) return '🎁'
    return '🎁'
  }

  async function confirmRedeem(reward: Reward) {
    setSubmitting(true)
    try {
      const res = await fetch('/api/rewards/redeem', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reward_id: reward.id }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal menukar')
      setMessage('Penukaran berhasil')
      setSelected(null)
      fetchRewards()
      fetchStats()
    } catch (err: any) {
      setMessage(err.message || 'Terjadi kesalahan')
    } finally {
      setSubmitting(false)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  return (
    <div className={`${jakarta.className} min-h-screen bg-[#F0FDF4] flex`}>
      <UserSidebar />
      <main className="flex-1 p-8 min-h-[60vh]">
        {loading ? (
          <div className="text-sm text-gray-600">Memuat rewards...</div>
        ) : rewards.length === 0 ? (
          <div className="bg-white rounded-lg p-8 border border-gray-200 text-center text-gray-700 shadow-sm">
            <p className="text-lg font-medium mb-2">Belum ada reward tersedia</p>
            <p className="text-sm">Saat ini belum ada reward yang dapat ditukarkan. Coba lagi nanti atau kumpulkan lebih banyak poin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {rewards.map((r) => {
              const disabled = (points ?? 0) < Number(r.point_required) || Number(r.stock) <= 0
              return (
                <div key={r.id} className="bg-white p-4 rounded shadow border border-gray-200">
                  <div className="text-3xl mb-2">{iconFor(r)}</div>
                  <div className="font-medium text-gray-900">{r.name}</div>
                  <div className="text-sm text-gray-700">{r.description}</div>
                  <div className="mt-2">
                    <span className="font-semibold text-green-700">{r.point_required} pts</span>
                    <div className="text-xs text-gray-600">Stok: {r.stock}</div>
                  </div>
                  <div className="mt-3">
                    <button disabled={disabled} onClick={() => setSelected(r)} className={`w-full py-2 rounded ${disabled ? 'bg-gray-200 text-gray-500' : 'bg-[#16A34A] text-white'}`}>
                      Tukar
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {message && <div className="mt-4 text-sm text-green-700">{message}</div>}
      </main>



      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded p-6 w-11/12 max-w-md">
            <h3 className="text-lg font-medium mb-2">Konfirmasi Penukaran</h3>
            <p className="text-sm text-gray-700 mb-4">Tukar <strong>{selected.name}</strong> dengan <span className="font-semibold text-green-700">{selected.point_required} pts</span>?</p>
            <div className="flex gap-2 justify-end">
              <button className="px-4 py-2 rounded border" onClick={() => setSelected(null)}>Batal</button>
              <button className="px-4 py-2 rounded bg-[#16A34A] text-white" onClick={() => confirmRedeem(selected)} disabled={submitting}>{submitting ? 'Memproses...' : 'Konfirmasi'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
