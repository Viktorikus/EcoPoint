import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'
import { requireSession } from '@/lib/session'

export async function GET(req: Request) {
  const { session, error } = await requireSession()
  if (error) return error
  const userId = (session.user as any).id

  try {
    const [rows] = await pool.execute(
      `SELECT id, user_id, address, scheduled_at, status, notes, created_at
       FROM pickup_requests
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    ) as any

    return NextResponse.json(rows)
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const { session, error } = await requireSession()
  if (error) return error
  const userId = (session.user as any).id

  try {
    const body = await req.json()
    const { address, scheduled_at, notes } = body
    if (!address) return NextResponse.json({ error: 'Missing address' }, { status: 400 })

    const id = uuidv4()
    const status = 'WAITING'

    await pool.execute(
      'INSERT INTO pickup_requests (id, user_id, address, scheduled_at, status, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [id, userId, address, scheduled_at ?? null, status, notes ?? null]
    )

    return NextResponse.json({ ok: true, id }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
