"use client"

import React, { useEffect, useState } from "react"
import { Plus_Jakarta_Sans } from "next/font/google"
import Link from "next/link"
import UserSidebar from "@/components/user/Sidebar"

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "600"] })

type Pickup = {
  id: string
  user_id: string
  address: string
  scheduled_at: string | null
  status: string
  notes?: string | null
  created_at: string
}

export default function PickupPage() {
  const [address, setAddress] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [notes, setNotes] = useState("")

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [requests, setRequests] = useState<Pickup[] | null>(null)
  const [loadingRequests, setLoadingRequests] = useState(false)

  useEffect(() => {
    fetchRequests()
  }, [])

  async function fetchRequests() {
    setLoadingRequests(true)
    try {
      const res = await fetch("/api/pickup")
      if (!res.ok) throw new Error("Gagal memuat request")
      const data = await res.json()
      setRequests(data || [])
    } catch (e) {
      setRequests([])
    } finally {
      setLoadingRequests(false)
    }
  }

  function minDateISO() {
    const d = new Date()
    const year = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${year}-${m}-${day}`
  }

  function buildScheduledAt() {
    if (!date) return null
    if (!time) return date
    // combine local date and time into ISO string (no timezone conversion)
    return `${date}T${time}:00`
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!address.trim()) return setError("Alamat harus diisi")
    const minDate = minDateISO()
    if (date && date < minDate) return setError("Tanggal minimal hari ini")

    setSubmitting(true)
    try {
      const scheduled_at = buildScheduledAt()
      const res = await fetch("/api/pickup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, scheduled_at, notes }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || "Gagal mengirim request")
      }
      setSuccess("Request penjemputan terkirim")
      setAddress("")
      setDate("")
      setTime("")
      setNotes("")
      fetchRequests()
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan")
    } finally {
      setSubmitting(false)
      setTimeout(() => setSuccess(null), 3000)
    }
  }

  function renderBadge(status: string) {
    switch (status) {
      case "WAITING":
        return <span className="px-2 py-1 rounded text-sm bg-gray-100 text-gray-600">WAITING</span>
      case "SCHEDULED":
        return <span className="px-2 py-1 rounded text-sm bg-blue-100 text-blue-600">SCHEDULED</span>
      case "ON_THE_WAY":
        return <span className="px-2 py-1 rounded text-sm bg-yellow-100 text-yellow-600">ON_THE_WAY</span>
      case "DONE":
        return <span className="px-2 py-1 rounded text-sm bg-green-100 text-green-600">DONE</span>
      default:
        return <span className="px-2 py-1 rounded text-sm bg-gray-100 text-gray-600">{status}</span>
    }
  }

  return (
    <div className={`${jakarta.className} min-h-screen bg-[#F0FDF4] flex`}>
      <UserSidebar />
      <main className="flex-1 p-8">
        <section className="bg-white rounded-lg shadow p-6 mb-6 border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Form Penjemputan</h2>
          <p className="text-sm text-gray-600 mb-4">Isi alamat dan jadwal penjemputan.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-1">Alamat</label>
              <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full border px-3 py-2 rounded text-gray-900 placeholder:text-gray-400" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">Tanggal</label>
                <input type="date" value={date} min={minDateISO()} onChange={(e) => setDate(e.target.value)} className="w-full border px-3 py-2 rounded text-gray-900" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">Jam</label>
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full border px-3 py-2 rounded text-gray-900" />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-700 font-medium mb-1">Catatan (opsional)</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full border px-3 py-2 rounded text-gray-900 placeholder:text-gray-400" rows={3} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                {error && <div className="text-sm text-red-600">{error}</div>}
                {success && <div className="text-sm text-green-700">{success}</div>}
              </div>
              <div>
                <button type="submit" disabled={submitting} className="bg-[#16A34A] disabled:opacity-60 text-white px-4 py-2 rounded">
                  {submitting ? "Mengirim..." : "Minta Penjemputan"}
                </button>
              </div>
            </div>
          </form>
        </section>

        <section className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Riwayat Request</h2>

          {loadingRequests ? (
            <div className="text-sm text-gray-600">Memuat...</div>
          ) : requests && requests.length > 0 ? (
            <div className="space-y-3">
              {requests.map((r) => (
                <div key={r.id} className="p-3 border rounded flex items-start justify-between">
                  <div>
                    <div className="text-sm text-gray-800 font-medium">{r.address}</div>
                    <div className="text-xs text-gray-600">{r.scheduled_at ? new Date(r.scheduled_at).toLocaleString() : 'Tanpa jadwal'} • {new Date(r.created_at).toLocaleString()}</div>
                    {r.notes && <div className="text-sm text-gray-800 mt-1">Catatan: {r.notes}</div>}
                  </div>
                  <div className="ml-4">{renderBadge(r.status)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-600">Belum ada request penjemputan.</div>
          )}
        </section>
      </main>
    </div>
  )
}
