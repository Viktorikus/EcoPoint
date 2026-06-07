"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { Plus_Jakarta_Sans } from "next/font/google"
import UserSidebar from "@/components/user/Sidebar"

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "600", "700"] })

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState({ name: 'User', points: 0, level: 1, badges: ['Green Beginner'], totalWasteKg: 0 })
  const pathname = usePathname()

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      if (status === 'authenticated' && session?.user) {
        const name = (session.user as any).name || 'User'
        const points = (session.user as any).points ?? 0
        const level = (session.user as any).level ?? 1
        // fetch stats
        try {
          const res = await fetch('/api/user/stats')
          if (res.ok) {
            const data = await res.json()
            if (!mounted) return
            setUser({ name, points: data.points ?? points, level: data.level ?? level, badges: user.badges, totalWasteKg: data.totalWasteKg ?? 0 })
          } else {
            if (!mounted) return
            setUser({ name, points, level, badges: user.badges, totalWasteKg: 0 })
          }
        } catch (e) {
          if (!mounted) return
          setUser({ name, points, level, badges: user.badges, totalWasteKg: 0 })
        }
      }
      if (mounted) setLoading(false)
    }
    load()
    return () => { mounted = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session])

  return (
    <div className={`${jakarta.className} min-h-screen bg-[#F0FDF4] flex`}>
      <UserSidebar />
      <main className="flex-1 p-8">
        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <div className="text-sm text-gray-800">Poin Saya</div>
            <div className="mt-2 text-3xl font-bold text-[#16A34A]">{loading ? '...' : user.points}</div>
            <div className="text-sm text-gray-600 mt-1">Total poin yang dikumpulkan</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <div className="text-sm text-gray-800">Total Sampah</div>
            <div className="mt-2 text-3xl font-bold text-[#16A34A]">{loading ? '...' : `${user.totalWasteKg} kg`}</div>
            <div className="text-sm text-gray-600 mt-1">Total berat sampah yang dideposit</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <div className="text-sm text-gray-800">Level</div>
            <div className="mt-2 text-3xl font-bold text-[#16A34A]">{loading ? '...' : user.level}</div>
            <div className="text-sm text-gray-600 mt-1">Tingkat loyalitas pengguna</div>
          </div>
        </div>

        {/* Badges */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Badge</h2>
          <div className="flex gap-3 flex-wrap">
            {user.badges.map((b, i) => (
              <div key={i} className="bg-[#DCFCE7] text-[#166534] px-4 py-1 rounded-full text-sm font-medium shadow-sm">
                {b}
              </div>
            ))}
          </div>
        </section>

        {/* Shortcuts */}
        <section className="mb-20">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Shortcut</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link href="/dashboard/deposit" className="flex items-center gap-3 justify-center py-3 px-4 bg-[#16A34A] text-white rounded-xl shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v4a1 1 0 001 1h3l3 3 4-8 3 3h3a1 1 0 001-1V7" />
              </svg>
              <span className="font-medium">Deposit</span>
            </Link>

            <Link href="/dashboard/pickup" className="flex items-center gap-3 justify-center py-3 px-4 bg-[#16A34A] text-white rounded-xl shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.88 18.09A10 10 0 1113.91 3.12" />
              </svg>
              <span className="font-medium">Pickup</span>
            </Link>

            <Link href="/dashboard/rewards" className="flex items-center gap-3 justify-center py-3 px-4 bg-[#16A34A] text-white rounded-xl shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3v18h18" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2 2 2 4-4" />
              </svg>
              <span className="font-medium">Rewards</span>
            </Link>

            <Link href="/dashboard/report" className="flex items-center gap-3 justify-center py-3 px-4 bg-[#16A34A] text-white rounded-xl shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
              </svg>
              <span className="font-medium">Reports</span>
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
