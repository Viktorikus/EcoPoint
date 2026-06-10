"use client"

import { useEffect, useState } from "react"
import AdminSidebar from "@/components/admin/Sidebar"
import { Plus_Jakarta_Sans } from "next/font/google"

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"] })

export default function AdminRewardsPage() {
  const [rewards, setRewards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    category: "pulsa",
    pointRequired: 0,
    stock: 0,
    image: ""
  })
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    fetchRewards()
  }, [])

  async function fetchRewards() {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/rewards")
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setRewards(data.data || [])
    } catch (err) {
      console.error(err)
      setRewards([])
    } finally {
      setLoading(false)
    }
  }

  function openModal(reward?: any) {
    setSelectedFile(null)
    if (reward) {
      setEditingId(reward.id)
      setFormData({
        name: reward.name,
        category: reward.category,
        pointRequired: reward.point_required, // mapping dari DB
        stock: reward.stock,
        image: reward.image || ""
      })
    } else {
      setEditingId(null)
      setFormData({ name: "", category: "pulsa", pointRequired: 0, stock: 0, image: "" })
    }
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    setEditingId(null)
    setSelectedFile(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      let imageUrl = formData.image

      // Jika ada file baru yang dipilih, upload terlebih dahulu
      if (selectedFile) {
        const fileData = new FormData()
        fileData.append("file", selectedFile)

        const uploadRes = await fetch("/api/admin/rewards/upload", {
          method: "POST",
          body: fileData
        })

        if (!uploadRes.ok) {
          const errData = await uploadRes.json()
          throw new Error(errData.error || "Gagal upload gambar")
        }

        const uploadResult = await uploadRes.json()
        imageUrl = uploadResult.url
      }

      const url = editingId ? `/api/admin/rewards/${editingId}` : "/api/admin/rewards"
      const method = editingId ? "PATCH" : "POST"

      const payload = { ...formData, image: imageUrl }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to save reward")
      }

      await fetchRewards()
      closeModal()
    } catch (err: any) {
      console.error(err)
      alert(err.message || "Gagal menyimpan data reward")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Yakin ingin menghapus reward ini?")) return
    
    try {
      const res = await fetch(`/api/admin/rewards/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      
      setRewards(prev => prev.filter(r => r.id !== id))
    } catch (err) {
      console.error(err)
      alert("Gagal menghapus reward")
    }
  }

  return (
    <div className={`${jakarta.className} min-h-screen bg-[#F0FDF4] flex`}>
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Katalog Reward</h1>
            <p className="text-sm text-gray-600 mt-1">Kelola hadiah yang bisa ditukar dengan poin user</p>
          </div>
          <button
            onClick={() => openModal()}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            + Tambah Reward
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#16A34A] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : rewards.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center border border-gray-200">
            <div className="text-6xl mb-4">🎁</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Belum ada reward</h3>
            <p className="text-gray-500 mb-6">Tambahkan reward baru untuk mulai katalog.</p>
            <button
              onClick={() => openModal()}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Tambah Reward Pertama
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {rewards.map((reward) => (
              <div key={reward.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                <div className="h-48 bg-gray-100 relative">
                  {reward.image ? (
                    <img src={reward.image} alt={reward.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-gray-400">No Image</div>
                  )}
                  <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded text-xs font-bold text-[#16A34A] shadow">
                    {reward.point_required} Poin
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="text-xs font-semibold text-gray-500 mb-1 uppercase">{reward.category}</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{reward.name}</h3>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-sm text-gray-600">Stok: <span className="font-medium text-gray-900">{reward.stock}</span></span>
                    <div className="flex gap-2">
                      <button onClick={() => openModal(reward)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                      <button onClick={() => handleDelete(reward.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Hapus</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingId ? "Edit Reward" : "Tambah Reward"}
                </h2>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Reward</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-[#16A34A] focus:border-[#16A34A] text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-[#16A34A] focus:border-[#16A34A] text-gray-900 bg-white"
                  >
                    <option value="pulsa">Pulsa</option>
                    <option value="voucher">Voucher</option>
                    <option value="merchandise">Merchandise</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Poin Dibutuhkan</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.pointRequired}
                      onChange={(e) => setFormData({ ...formData, pointRequired: parseInt(e.target.value) || 0 })}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-[#16A34A] focus:border-[#16A34A] text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stok</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-[#16A34A] focus:border-[#16A34A] text-gray-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gambar Reward</label>
                  {formData.image && !selectedFile && (
                    <div className="mb-2">
                      <img src={formData.image} alt="Preview" className="h-20 rounded border border-gray-200" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg, image/png, image/webp"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-[#16A34A] focus:border-[#16A34A] text-gray-900"
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: JPG, PNG, WebP (Max 2MB)</p>
                </div>
                
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white rounded font-medium disabled:opacity-50 transition-colors"
                  >
                    {isSubmitting ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
