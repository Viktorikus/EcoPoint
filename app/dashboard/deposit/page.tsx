"use client"

import React, { useEffect, useMemo, useState } from "react"
import { Plus_Jakarta_Sans } from "next/font/google"
import Link from "next/link"
import UserSidebar from "@/components/user/Sidebar"

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "600"] })

type Category = {
  id: number
  name: string
  point_per_kg: number
}

type Deposit = {
  id: number
  created_at: string
  category_id: number
  category_name: string
  weight: number
  points: number
  status: "PENDING" | "VERIFIED" | "REJECTED"
}

export default function DepositPage() {
  const [categories, setCategories] = useState<Category[] | null>(null)
  const [deposits, setDeposits] = useState<Deposit[] | null>(null)
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [loadingDeposits, setLoadingDeposits] = useState(false)

  const [categoryId, setCategoryId] = useState<number | "">("")
  const [weight, setWeight] = useState<number | "">("")
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
    fetchDeposits()
  }, [])

  async function fetchCategories() {
    setLoadingCategories(true)
    try {
      const res = await fetch("/api/categories")
      if (!res.ok) throw new Error("Gagal memuat kategori")
      const data = await res.json()
      setCategories(data || [])
    } catch (err) {
      setCategories([])
    } finally {
      setLoadingCategories(false)
    }
  }

  async function fetchDeposits() {
    setLoadingDeposits(true)
    try {
      const res = await fetch("/api/deposits")
      if (!res.ok) throw new Error("Gagal memuat riwayat")
      const data = await res.json()
      setDeposits(data || [])
    } catch (err) {
      setDeposits([])
    } finally {
      setLoadingDeposits(false)
    }
  }

  useEffect(() => {
    if (!photo) {
      setPhotoPreview(null)
      return
    }
    const url = URL.createObjectURL(photo)
    setPhotoPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [photo])

  const selectedCategory = useMemo(() => {
    return categories?.find((c) => c.id === categoryId) ?? null
  }, [categories, categoryId])

  const estimatedPoints = useMemo(() => {
    if (!selectedCategory || !weight) return 0
    const w = typeof weight === "string" ? parseFloat(weight) || 0 : weight
    return Math.max(0, Math.round(w * selectedCategory.point_per_kg))
  }, [selectedCategory, weight])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!categoryId) return setErrorMsg("Pilih kategori terlebih dahulu")
    const w = typeof weight === "string" ? parseFloat(weight) : weight
    if (!w || w <= 0) return setErrorMsg("Masukkan berat minimal 0.1 kg")
    if (!photo) return setErrorMsg("Unggah foto bukti setoran")

    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append("category_id", String(categoryId))
      fd.append("weight", String(w))
      fd.append("photo", photo)

      const res = await fetch("/api/deposits", { method: "POST", body: fd })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Gagal" }))
        throw new Error(err.error || "Gagal mengirim setoran")
      }

      setSuccessMsg("Setoran berhasil dikirim. Menunggu verifikasi.")
      setCategoryId("")
      setWeight("")
      setPhoto(null)
      setTimeout(() => setSuccessMsg(null), 4000)
      fetchDeposits()
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={`${jakarta.className} min-h-screen bg-[#F0FDF4] flex`}>
      <UserSidebar />
      <main className="flex-1 p-8">
        <section className="bg-white rounded-lg shadow p-6 mb-6 border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Form Setoran</h2>
          <p className="text-sm text-gray-600 mb-4">Isi data setoran untuk mendapatkan poin.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-1">Kategori</label>
              {loadingCategories ? (
                <div className="text-sm text-gray-600">Memuat kategori...</div>
              ) : categories && categories.length > 0 ? (
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(Number(e.target.value) || "")}
                  className="w-full border px-3 py-2 rounded text-gray-900"
                >
                  <option value="">Pilih kategori</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.point_per_kg} poin/kg
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-sm text-gray-600">Tidak ada kategori.</div>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-700 font-medium mb-1">Berat (kg)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={weight as any}
                onChange={(e) => setWeight(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full border px-3 py-2 rounded text-gray-900 placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 font-medium mb-1">Foto Bukti</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
                className="w-full text-gray-900"
              />
              {photoPreview && <img src={photoPreview} alt="preview" className="mt-2 max-h-40 rounded" />}
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Estimasi poin</div>
                <div className="text-xl font-semibold text-gray-900">{estimatedPoints} pts</div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#16A34A] disabled:opacity-60 text-white px-4 py-2 rounded"
                >
                  {submitting ? "Mengirim..." : "Kirim Setoran"}
                </button>
              </div>
            </div>

            {errorMsg && <div className="text-sm text-red-600">{errorMsg}</div>}
            {successMsg && <div className="text-sm text-green-700">{successMsg}</div>}
          </form>
        </section>

        <section className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Riwayat Setoran</h2>

          {loadingDeposits ? (
            <div className="text-sm text-gray-600">Memuat riwayat...</div>
          ) : deposits && deposits.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left table-auto">
                <thead>
                  <tr className="text-sm text-gray-700 font-semibold">
                    <th className="px-3 py-2">Tanggal</th>
                    <th className="px-3 py-2">Kategori</th>
                    <th className="px-3 py-2">Berat (kg)</th>
                    <th className="px-3 py-2">Poin</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {deposits.map((d) => (
                    <tr key={d.id} className="border-t">
                      <td className="px-3 py-2 text-sm text-gray-800">{new Date(d.created_at).toLocaleString()}</td>
                      <td className="px-3 py-2 text-sm text-gray-800">{d.category_name}</td>
                      <td className="px-3 py-2 text-sm text-gray-800">{d.weight}</td>
                      <td className="px-3 py-2 text-sm text-gray-800">{d.points}</td>
                      <td className="px-3 py-2">
                        {d.status === "PENDING" && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-sm bg-yellow-100 text-yellow-800">PENDING</span>
                        )}
                        {d.status === "VERIFIED" && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-sm bg-green-100 text-green-800">VERIFIED</span>
                        )}
                        {d.status === "REJECTED" && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-sm bg-red-100 text-red-800">REJECTED</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-sm text-gray-600">Belum ada riwayat setoran.</div>
          )}
        </section>
      </main>
    </div>
  )
}
