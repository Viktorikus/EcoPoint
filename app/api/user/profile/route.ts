import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { requireSession } from '@/lib/session'

export async function PATCH(req: Request) {
  const { session, error } = await requireSession()
  if (error) return error
  const userId = (session.user as any).id

  try {
    const body = await req.json()
    const { name, phone, address } = body
    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })

    await pool.execute('UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?', [name, phone ?? null, address ?? null, userId])

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
