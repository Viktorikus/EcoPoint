"use client"

import React, { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Plus_Jakarta_Sans } from "next/font/google"
import Link from "next/link"
import UserSidebar from "@/components/user/Sidebar"

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "600"] })

type UserRow = { id: string; name: string; points: number; level: number }

export default function LeaderboardPage() {
  const { data: session } = useSession()
  const userId = (session as any)?.user?.id
  const [rows, setRows] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchRows() }, [])

  async function fetchRows() {
    setLoading(true)
    try {
      const res = await fetch('/api/leaderboard')
      if (!res.ok) throw new Error('Gagal memuat leaderboard')
      const data = await res.json()
      setRows(data || [])
    } catch (e) {
      setRows([])
    } finally { setLoading(false) }
  }

  const userIndex = rows.findIndex(r => r.id === userId)

  return (
    <div className={`${jakarta.className} min-h-screen bg-[#F0FDF4] flex`}>
      <UserSidebar />
      <main className="flex-1 p-8">
        {loading ? (
          <div className="text-sm text-gray-600">Memuat leaderboard...</div>
        ) : (
          <div className="bg-white rounded shadow border border-gray-200">
            <table className="w-full text-left">
              <thead>
                <tr className="text-sm text-gray-700 font-semibold">
                  <th className="px-3 py-2">No.</th>
                  <th className="px-3 py-2">Nama</th>
                  <th className="px-3 py-2">Poin</th>
                  <th className="px-3 py-2">Level</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const isUser = r.id === userId
                  const numCell = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : String(i + 1)
                  return (
                    <tr key={r.id} className={`${isUser ? 'bg-green-50 border-l-4 border-green-500' : ''} border-t text-gray-800`}>
                      <td className="px-3 py-2">{numCell}</td>
                      <td className="px-3 py-2">{r.name}</td>
                      <td className="px-3 py-2 font-semibold text-green-700">{r.points}</td>
                      <td className="px-3 py-2">{r.level}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
