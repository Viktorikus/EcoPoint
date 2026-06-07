"use client"

import Link from "next/link"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus_Jakarta_Sans } from "next/font/google"

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "600", "700"] })

const schema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Password harus diisi"),
})

type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const { register, handleSubmit, formState } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    setIsLoading(true)
    setErrorMessage("")

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      })

      if (res?.error) {
        setErrorMessage("Email atau password salah.")
        setIsLoading(false)
        return
      }

      if (res?.ok) {
        const sessionRes = await fetch('/api/auth/session')
        const session = await sessionRes.json()
        const role = session?.user?.role

        if (role === 'ADMIN') router.push('/admin/dashboard')
        else if (role === 'PETUGAS') router.push('/petugas/dashboard')
        else router.push('/dashboard')
      }
    } catch (e) {
      setErrorMessage("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`${jakarta.className} min-h-screen bg-gray-50 flex items-center justify-center p-4`}> 
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <aside className="hidden md:flex flex-col items-start justify-center bg-gradient-to-br from-white to-green-50 rounded-2xl p-10 shadow-lg">
          <div className="bg-green-100 p-3 rounded-full inline-flex items-center justify-center mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">EcoPoint</h1>
          <p className="text-gray-700">Platform Manajemen Sampah Pintar — pantau, kumpulkan, dan beri reward untuk aksi ramah lingkungan.</p>
        </aside>

        <main className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-800 mb-1">Masuk ke EcoPoint</h2>
          <p className="text-sm text-gray-600 mb-6">Masukkan kredensial Anda untuk mengakses dashboard.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {errorMessage && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-100 px-3 py-2 rounded">{errorMessage}</div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                autoComplete="email"
                {...register("email")}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A] text-gray-900 placeholder:text-gray-400"
                placeholder="email@contoh.com"
              />
              {formState.errors.email && (
                <p className="mt-1 text-sm text-red-600">{String(formState.errors.email.message)}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                autoComplete="current-password"
                {...register("password")}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A] text-gray-900 placeholder:text-gray-400"
                placeholder="Masukkan password"
              />
              {formState.errors.password && (
                <p className="mt-1 text-sm text-red-600">{String(formState.errors.password.message)}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                <input type="checkbox" className="h-4 w-4 text-[#16A34A] border-gray-300 rounded" />
                <span>Ingat saya</span>
              </label>
              <Link href="/auth/register" className="text-sm text-[#16A34A] hover:underline">Daftar</Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex justify-center items-center gap-2 px-4 py-3 bg-[#16A34A] text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-70"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
              ) : null}
              {isLoading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Atau masuk dengan</p>
            <div className="mt-3 flex items-center justify-center gap-3">
              <button className="px-3 py-2 border rounded-md text-sm">Google</button>
              <button className="px-3 py-2 border rounded-md text-sm">Facebook</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
