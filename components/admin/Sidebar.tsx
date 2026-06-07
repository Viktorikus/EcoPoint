"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Plus_Jakarta_Sans } from "next/font/google"

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "600"] })

export default function AdminSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const admin = (session as any)?.user

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/")

  const menuItems = [
    { label: "Dashboard", icon: "🏠", path: "/admin/dashboard" },
    { label: "Users", icon: "👥", path: "/admin/users" },
    { label: "Setoran", icon: "♻️", path: "/admin/deposits" },
    { label: "Laporan", icon: "📋", path: "/admin/reports" },
    { label: "Rewards", icon: "🎁", path: "/admin/rewards" },
    { label: "Analitik", icon: "📊", path: "/admin/analytics" },
  ]

  return (
    <div className={`${jakarta.className} w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col shadow-sm`}>
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-[#16A34A] p-2 rounded-lg">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">EcoPoint</h1>
        </div>
        <p className="text-xs text-gray-600">Admin Panel</p>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
              isActive(item.path)
                ? "bg-green-50 text-[#16A34A] font-semibold"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Admin Info & Logout */}
      <div className="p-4 border-t border-gray-200 space-y-3">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">Admin</p>
          <p className="text-sm font-semibold text-gray-900">{admin?.name || "Admin"}</p>
          <p className="text-xs text-gray-600">{admin?.role || "ADMIN"}</p>
        </div>
        <button
          onClick={() => signOut({ redirect: true, callbackUrl: "/auth/login" })}
          className="w-full px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  )
}
