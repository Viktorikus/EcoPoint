import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password, phone, address } = body
    if (!name || !email || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    // check existing
    const [rows] = await pool.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [email]) as any
    const existing = Array.isArray(rows) ? rows[0] : rows
    if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 409 })

    const hashed = await bcrypt.hash(password, 10)
    const id = uuidv4()
    await pool.execute(
      'INSERT INTO users (id, name, email, password, phone, address, role, points, level, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 1, NOW())',
      [id, name, email, hashed, phone ?? null, address ?? null, 'USER']
    )

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 })
  }
}
