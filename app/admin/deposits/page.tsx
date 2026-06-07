import AdminSidebar from "@/components/admin/Sidebar"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Plus_Jakarta_Sans } from "next/font/google"
import { Suspense } from "react"

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "600", "700"] })

async function getDeposits() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
    const res = await fetch(`${baseUrl}/api/admin/deposits`, {
      cache: "no-store",
    })
    if (!res.ok) return null
    return res.json()
  } catch (err) {
    console.error("Failed to fetch deposits:", err)
    return null
  }
}

function LoadingState() {
  return (
    <div className="flex justify-center items-center p-12">
      <div className="w-8 h-8 border-4 border-[#16A34A] border-t-transparent rounded-full animate-spin"></div>
    </div>
  )
}

export default async function AdminDepositsPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'ADMIN') {
    redirect('/auth/login')
  }

  return (
    <div className={`${jakarta.className} min-h-screen bg-[#F0FDF4] flex`}>
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Data Setoran Sampah</h1>
          <p className="text-sm text-gray-600 mt-1">Kelola dan pantau semua riwayat setoran sampah dari user</p>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <Suspense fallback={<LoadingState />}>
            <DepositsTable />
          </Suspense>
        </div>
      </main>
    </div>
  )
}

async function DepositsTable() {
  const response = await getDeposits()
  const deposits = response?.data || []

  if (deposits.length === 0) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center">
        <div className="text-6xl mb-4">📭</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Belum ada setoran</h3>
        <p className="text-gray-500">Data setoran sampah dari user akan muncul di sini.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="bg-[#16A34A] text-white">
            <th className="px-6 py-4 font-semibold whitespace-nowrap">Tanggal</th>
            <th className="px-6 py-4 font-semibold whitespace-nowrap">Nama User</th>
            <th className="px-6 py-4 font-semibold whitespace-nowrap">Kategori</th>
            <th className="px-6 py-4 font-semibold whitespace-nowrap">Berat (kg)</th>
            <th className="px-6 py-4 font-semibold whitespace-nowrap">Poin</th>
            <th className="px-6 py-4 font-semibold whitespace-nowrap">Status</th>
          </tr>
        </thead>
        <tbody>
          {deposits.map((deposit: any) => (
            <tr key={deposit.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                {new Date(deposit.created_at).toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </td>
              <td className="px-6 py-4 text-gray-900 font-medium whitespace-nowrap">{deposit.user_name}</td>
              <td className="px-6 py-4 text-gray-700 whitespace-nowrap">{deposit.category_name}</td>
              <td className="px-6 py-4 text-gray-700 whitespace-nowrap">{deposit.weight}</td>
              <td className="px-6 py-4 text-green-700 font-semibold whitespace-nowrap">+{deposit.point}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    deposit.status === "VERIFIED"
                      ? "bg-green-100 text-green-800"
                      : deposit.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {deposit.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
