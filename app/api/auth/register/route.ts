import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import bcrypt from 'bcryptjs'
import { registerSchema, validateBody } from '@/lib/validation'

export async function POST(req: Request) {
  const { data, error } = await validateBody(registerSchema, req)
  if (error) return error

  const { name, email, password, phone, address } = data

  try {
    const conn = await pool.getConnection()
    try {
      // Cek email duplicate
      const [existing]: any = await conn.query(
        'SELECT id FROM users WHERE email = ? LIMIT 1',
        [email]
      )
      if (existing.length > 0) {
        conn.release()
        return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 409 })
      }

      // Hash password dengan rounds 12
      const hashedPassword = await bcrypt.hash(password, 12)
      const id = crypto.randomUUID()

      await conn.query(
        'INSERT INTO users (id, name, email, password, phone, address, role, points, level) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, name, email, hashedPassword, phone || null, address || null, 'USER', 0, 1]
      )
      conn.release()

      return NextResponse.json({
        message: 'Registrasi berhasil',
        user: { id, name, email, role: 'USER' }
      }, { status: 201 })

    } catch (err) {
      conn.release()
      throw err
    }
  } catch (err: any) {
    console.error('Register error:', err)
    return NextResponse.json({ error: 'Gagal mendaftar' }, { status: 500 })
  }
}
