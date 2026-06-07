import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { requireSession } from '@/lib/session'
import bcrypt from 'bcryptjs'

export async function PATCH(req: Request) {
  const { session, error } = await requireSession()
  if (error) return error
  const userId = (session.user as any).id

  try {
    const body = await req.json()
    const { old_password, new_password, confirm } = body
    if (!old_password || !new_password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    if (new_password !== confirm) return NextResponse.json({ error: 'Password confirmation does not match' }, { status: 400 })

    const [rows] = await pool.execute('SELECT password FROM users WHERE id = ? LIMIT 1', [userId]) as any
    const user = Array.isArray(rows) ? rows[0] : rows
    const hashed = user?.password
    if (!hashed) return NextResponse.json({ error: 'User password not found' }, { status: 400 })

    const ok = await bcrypt.compare(old_password, hashed)
    if (!ok) return NextResponse.json({ error: 'Old password incorrect' }, { status: 400 })

    const newHashed = await bcrypt.hash(new_password, 10)
    await pool.execute('UPDATE users SET password = ? WHERE id = ?', [newHashed, userId])

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
