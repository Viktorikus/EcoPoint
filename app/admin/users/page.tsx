"use client"

import { useEffect, useState } from "react"
import AdminSidebar from "@/components/admin/Sidebar"
import { Plus_Jakarta_Sans } from "next/font/google"

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "600"] })

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("ALL")
  const [currentPage, setCurrentPage] = useState(1)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const itemsPerPage = 10

  useEffect(() => {
    fetchUsers()
  }, [search, roleFilter])

  async function fetchUsers() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (roleFilter && roleFilter !== "ALL") params.append("role", roleFilter)

      const res = await fetch(`/api/admin/users?${params.toString()}`)
      if (!res.ok) throw new Error("Failed to fetch users")

      const data = await res.json()
      setUsers(data.users || [])
      setCurrentPage(1)
    } catch (err) {
      console.error("Fetch users error:", err)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  async function toggleUserStatus(userId: string) {
    setTogglingId(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}/toggle`, { method: "PATCH" })
      if (!res.ok) throw new Error("Failed to toggle user")

      const data = await res.json()
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, is_active: data.is_active } : u
        )
      )
    } catch (err) {
      console.error("Toggle user error:", err)
      alert("Gagal mengubah status user")
    } finally {
      setTogglingId(null)
    }
  }

  const paginatedUsers = users.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const totalPages = Math.ceil(users.length / itemsPerPage)

  return (
    <div className={`${jakarta.className} min-h-screen bg-[#F0FDF4] flex`}>
      <AdminSidebar />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Users</h1>
          <p className="text-sm text-gray-600 mt-1">Total: {users.length} users</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cari Nama/Email</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ketik nama atau email..."
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A] text-gray-900 placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A] text-gray-900"
              >
                <option value="ALL">Semua Role</option>
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
                <option value="PETUGAS">Petugas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Nama</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Poin</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Level</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Tanggal Daftar</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-600">
                      Memuat data...
                    </td>
                  </tr>
                ) : paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-600">
                      Tidak ada user yang ditemukan
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-900 font-medium">{user.name}</td>
                      <td className="px-6 py-4 text-gray-700 text-xs">{user.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            user.role === "ADMIN"
                              ? "bg-purple-100 text-purple-800"
                              : user.role === "PETUGAS"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-green-700 font-semibold">{user.points || 0}</td>
                      <td className="px-6 py-4 text-gray-700 font-medium">{user.level || 1}</td>
                      <td className="px-6 py-4 text-gray-600 text-xs">
                        {new Date(user.created_at).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            user.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.is_active ? "Aktif" : "Suspend"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleUserStatus(user.id)}
                          disabled={togglingId === user.id}
                          className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                            user.is_active
                              ? "bg-red-50 text-red-700 hover:bg-red-100"
                              : "bg-green-50 text-green-700 hover:bg-green-100"
                          } disabled:opacity-50`}
                        >
                          {togglingId === user.id ? "Memproses..." : user.is_active ? "Suspend" : "Aktifkan"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Halaman {currentPage} dari {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Sebelumnya
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Berikutnya
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
