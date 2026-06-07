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
    category: "",
    point_required: 0,
    stock: 0,
    image: ""
  })

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
    if (reward) {
      setEditingId(reward.id)
      setFormData({
        name: reward.name,
        category: reward.category,
        point_required: reward.point_required,
        stock: reward.stock,
        image: reward.image || ""
      })
    } else {
      setEditingId(null)
      setFormData({ name: "", category: "", point_required: 0, stock: 0, image: "" })
    }
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    setEditingId(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = editingId ? `/api/admin/rewards/${editingId}` : "/api/admin/rewards"
      const method = editingId ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (!res.ok) throw new Error("Failed to save reward")

      await fetchRewards()
      closeModal()
    } catch (err) {
      console.error(err)
      alert("Gagal menyimpan data reward")
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
                  <div className="text-xs font-semibold text-gray-500 mb-1">{reward.category}</div>
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
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Contoh: E-Wallet, Pulsa, Sembako"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-[#16A34A] focus:border-[#16A34A] text-gray-900"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Poin Dibutuhkan</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.point_required}
                      onChange={(e) => setFormData({ ...formData, point_required: parseInt(e.target.value) || 0 })}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL Gambar</label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://..."
                    className="w-full p-2 border border-gray-300 rounded focus:ring-[#16A34A] focus:border-[#16A34A] text-gray-900"
                  />
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
