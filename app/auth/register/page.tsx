"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus_Jakarta_Sans } from "next/font/google"

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "600", "700"] })

const schema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  phone: z.string().optional(),
  address: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const { register, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(values: FormValues) {
    setIsLoading(true)
    setErrorMessage("")
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setErrorMessage(data.error ?? "Registrasi gagal.")
        return
      }
      router.push("/auth/login?registered=1")
    } catch (err) {
      setErrorMessage("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`${jakarta.className} min-h-screen bg-gray-50 flex items-center justify-center p-4`}>
      <div className="w-full max-w-lg bg-white rounded-2xl p-8 shadow">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Daftar EcoPoint</h1>
        <p className="text-sm text-gray-600 mb-6">Buat akun untuk mulai mengelola sampah.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{errorMessage}</div>
          )}

          <div>
            <label className="block text-sm text-gray-700 font-medium mb-1">Nama Lengkap</label>
            <input type="text" {...register('name')} className="w-full px-4 py-3 border rounded text-gray-900 placeholder:text-gray-400" />
            {formState.errors.name && <p className="text-sm text-red-600">{(formState.errors.name as any).message}</p>}
          </div>

          <div>
            <label className="block text-sm text-gray-700 font-medium mb-1">Email</label>
            <input type="email" {...register('email')} className="w-full px-4 py-3 border rounded text-gray-900 placeholder:text-gray-400" />
            {formState.errors.email && <p className="text-sm text-red-600">{(formState.errors.email as any).message}</p>}
          </div>

          <div>
            <label className="block text-sm text-gray-700 font-medium mb-1">Password</label>
            <input type="password" {...register('password')} className="w-full px-4 py-3 border rounded text-gray-900 placeholder:text-gray-400" />
            {formState.errors.password && <p className="text-sm text-red-600">{(formState.errors.password as any).message}</p>}
          </div>

          <div>
            <label className="block text-sm text-gray-700 font-medium mb-1">No. HP (opsional)</label>
            <input type="text" {...register('phone')} className="w-full px-4 py-3 border rounded text-gray-900 placeholder:text-gray-400" />
          </div>

          <div>
            <label className="block text-sm text-gray-700 font-medium mb-1">Alamat (opsional)</label>
            <textarea {...register('address')} className="w-full px-4 py-3 border rounded text-gray-900 placeholder:text-gray-400" rows={3} />
          </div>

          <div>
            <button type="submit" disabled={isLoading} className="w-full py-3 bg-[#16A34A] text-white rounded-lg">
              {isLoading ? "Mendaftar..." : "Daftar Sekarang"}
            </button>
          </div>
        </form>

        <p className="text-sm text-gray-600 mt-4">Sudah punya akun? <Link href="/auth/login" className="text-[#16A34A]">Masuk</Link></p>
      </div>
    </div>
  )
}
