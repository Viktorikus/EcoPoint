import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(req: Request) {
  try {
    const [rows] = await pool.execute("SELECT id, name, points, level FROM users WHERE role = 'USER' ORDER BY points DESC LIMIT 20") as any
    return NextResponse.json(rows)
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
