"use client"

import React, { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { Plus_Jakarta_Sans } from "next/font/google"
import Link from "next/link"
import UserSidebar from "@/components/user/Sidebar"

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "600"] })

export default function ProfilePage() {
  const { data: session } = useSession()
  const user = (session as any)?.user

  const [stats, setStats] = useState<any>(null)

  const [name, setName] = useState(user?.name ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [address, setAddress] = useState(user?.address ?? '')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMsg, setProfileMsg] = useState<string | null>(null)

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPw, setChangingPw] = useState(false)
  const [pwMsg, setPwMsg] = useState<string | null>(null)

  useEffect(() => { fetchStats() }, [])

  async function fetchStats() {
    try {
      const res = await fetch('/api/user/stats')
      if (!res.ok) return
      const data = await res.json()
      setStats(data)
    } catch (e) {
      // ignore
    }
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSavingProfile(true)
    setProfileMsg(null)
    try {
      const res = await fetch('/api/user/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, phone, address }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan')
      setProfileMsg('Profil tersimpan')
    } catch (err: any) {
      setProfileMsg(err.message || 'Terjadi kesalahan')
    } finally {
      setSavingProfile(false)
      setTimeout(() => setProfileMsg(null), 3000)
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    setChangingPw(true)
    setPwMsg(null)
    try {
      const res = await fetch('/api/user/password', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ old_password: oldPassword, new_password: newPassword, confirm: confirmPassword }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal mengganti password')
      setPwMsg('Password berhasil diubah')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      setPwMsg(err.message || 'Terjadi kesalahan')
    } finally {
      setChangingPw(false)
      setTimeout(() => setPwMsg(null), 3000)
    }
  }

  function avatarLetter() {
    return (user?.name ?? 'U').charAt(0).toUpperCase()
  }

  return (
    <div className={`${jakarta.className} min-h-screen bg-[#F0FDF4] flex`}>
      <UserSidebar />
      <main className="flex-1 p-8 space-y-6">
        <section className="bg-white rounded-lg shadow p-6 border border-gray-200 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-green-200 flex items-center justify-center text-2xl font-bold text-green-800">{avatarLetter()}</div>
          <div>
            <div className="font-semibold text-gray-900">{user?.name}</div>
            <div className="text-sm text-gray-700">{user?.email}</div>
            <div className="text-sm text-gray-700">Role: {user?.role}</div>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-lg font-medium text-gray-800 font-semibold mb-2">Statistik</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 p-3 rounded text-center">
              <div className="text-sm text-gray-700">Total Setoran</div>
              <div className="font-semibold text-gray-900">{stats?.totalDeposits ?? 0}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded text-center">
              <div className="text-sm text-gray-700">Poin</div>
              <div className="font-semibold text-green-700">{stats?.points ?? 0}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded text-center">
              <div className="text-sm text-gray-700">Level</div>
              <div className="font-semibold text-gray-900">{stats?.level ?? 1}</div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-lg font-medium text-gray-800 font-semibold mb-2">Edit Profil</h2>
          <form onSubmit={saveProfile} className="space-y-3">
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-1">Nama</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border px-3 py-2 rounded text-gray-900 placeholder:text-gray-400" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-1">No. HP</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border px-3 py-2 rounded text-gray-900 placeholder:text-gray-400" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-1">Alamat</label>
              <textarea value={address} onChange={(e) => setAddress(e.target.value)} className="w-full border px-3 py-2 rounded text-gray-900 placeholder:text-gray-400" rows={3} />
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={savingProfile} className="bg-[#16A34A] px-4 py-2 rounded text-white">{savingProfile ? 'Menyimpan...' : 'Simpan'}</button>
            </div>
            {profileMsg && <div className="text-sm text-gray-700">{profileMsg}</div>}
          </form>
        </section>

        <section className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-lg font-medium text-gray-800 font-semibold mb-2">Ganti Password</h2>
          <form onSubmit={changePassword} className="space-y-3">
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-1">Password Lama</label>
              <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="w-full border px-3 py-2 rounded text-gray-900 placeholder:text-gray-400" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-1">Password Baru</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full border px-3 py-2 rounded text-gray-900 placeholder:text-gray-400" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-1">Konfirmasi Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full border px-3 py-2 rounded text-gray-900 placeholder:text-gray-400" />
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={changingPw} className="bg-[#16A34A] px-4 py-2 rounded text-white">{changingPw ? 'Memproses...' : 'Ganti Password'}</button>
            </div>
            {pwMsg && <div className="text-sm text-gray-700">{pwMsg}</div>}
          </form>
        </section>
      </main>
    </div>
  )
}
