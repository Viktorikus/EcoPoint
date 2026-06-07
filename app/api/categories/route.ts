import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { requireSession } from '@/lib/session'

export async function GET() {
  const { session, error } = await requireSession()
  if (error) return error

  try {
    const [rows] = await pool.execute('SELECT id, name, point_per_kg, price_per_kg FROM waste_categories ORDER BY name') as any
    return NextResponse.json(rows)
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
