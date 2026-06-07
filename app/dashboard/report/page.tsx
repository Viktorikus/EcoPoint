"use client"

import React, { useEffect, useState } from "react"
import { Plus_Jakarta_Sans } from "next/font/google"
import Link from "next/link"
import UserSidebar from "@/components/user/Sidebar"

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "600"] })

type Report = {
  id: string
  photo: string | null
  location: string
  description: string
  status: string
  created_at: string
}

export default function ReportPage() {
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [reports, setReports] = useState<Report[] | null>(null)
  const [loadingReports, setLoadingReports] = useState(false)

  useEffect(() => {
    fetchReports()
  }, [])

  useEffect(() => {
    if (!photo) return setPhotoPreview(null)
    const url = URL.createObjectURL(photo)
    setPhotoPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [photo])

  async function fetchReports() {
    setLoadingReports(true)
    try {
      const res = await fetch('/api/reports')
      if (!res.ok) throw new Error('Gagal memuat laporan')
      const data = await res.json()
      setReports(data || [])
    } catch (e) {
      setReports([])
    } finally {
      setLoadingReports(false)
    }
  }

  function truncate(text: string, n = 80) {
    if (!text) return ''
    return text.length > n ? text.slice(0, n) + '…' : text
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    if (!photo) return setError('Foto wajib diunggah')
    if (!location.trim()) return setError('Lokasi wajib diisi')
    if (!description.trim()) return setError('Deskripsi wajib diisi')

    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('photo', photo)
      fd.append('location', location)
      fd.append('description', description)

      const res = await fetch('/api/reports', { method: 'POST', body: fd })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Gagal mengirim laporan')
      }
      setSuccess('Laporan terkirim')
      setPhoto(null)
      setLocation('')
      setDescription('')
      fetchReports()
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan')
    } finally {
      setSubmitting(false)
      setTimeout(() => setSuccess(null), 3000)
    }
  }

  function statusBadge(status: string) {
    if (status === 'REPORTED') return <span className="px-2 py-1 rounded text-sm bg-red-100 text-red-600">REPORTED</span>
    if (status === 'ON_PROGRESS') return <span className="px-2 py-1 rounded text-sm bg-yellow-100 text-yellow-600">ON_PROGRESS</span>
    if (status === 'COMPLETED') return <span className="px-2 py-1 rounded text-sm bg-green-100 text-green-600">COMPLETED</span>
    return <span className="px-2 py-1 rounded text-sm bg-gray-100 text-gray-600">{status}</span>
  }

  return (
    <div className={`${jakarta.className} min-h-screen bg-[#F0FDF4] flex`}>
      <UserSidebar />
      <main className="flex-1 p-8">
        <section className="bg-white rounded-lg shadow p-6 mb-6 border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Form Laporan</h2>
          <p className="text-sm text-gray-600 mb-4">Laporkan lokasi sampah liar dengan foto.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-1">Foto</label>
              <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} className="text-gray-900" />
              {photoPreview && <img src={photoPreview} alt="preview" className="mt-2 max-h-40 rounded" />}
            </div>

            <div>
              <label className="block text-sm text-gray-700 font-medium mb-1">Lokasi</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)} className="w-full border px-3 py-2 rounded text-gray-900 placeholder:text-gray-400" />
            </div>

            <div>
              <label className="block text-sm text-gray-700 font-medium mb-1">Deskripsi</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border px-3 py-2 rounded text-gray-900 placeholder:text-gray-400" rows={4} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                {error && <div className="text-sm text-red-600">{error}</div>}
                {success && <div className="text-sm text-green-700">{success}</div>}
              </div>
              <div>
                <button type="submit" disabled={submitting} className="bg-[#16A34A] disabled:opacity-60 text-white px-4 py-2 rounded">
                  {submitting ? 'Mengirim...' : 'Kirim Laporan'}
                </button>
              </div>
            </div>
          </form>
        </section>

        <section className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Riwayat Laporan</h2>

          {loadingReports ? (
            <div className="text-sm text-gray-600">Memuat...</div>
          ) : reports && reports.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left table-auto">
                <thead>
                  <tr className="text-sm text-gray-700 font-semibold">
                    <th className="px-3 py-2">Tanggal</th>
                    <th className="px-3 py-2">Lokasi</th>
                    <th className="px-3 py-2">Deskripsi</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r.id} className="border-t">
                      <td className="px-3 py-2 text-sm text-gray-800">{new Date(r.created_at).toLocaleString()}</td>
                      <td className="px-3 py-2 text-sm text-gray-800">{r.location}</td>
                      <td className="px-3 py-2 text-sm text-gray-800">{truncate(r.description, 80)}</td>
                      <td className="px-3 py-2">{statusBadge(r.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-sm text-gray-600">Belum ada laporan.</div>
          )}
        </section>
      </main>
    </div>
  )

}
