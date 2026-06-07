import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(req: Request) {
  try {
    const [rows] = await pool.execute('SELECT id, name, description, point_required, stock, category FROM rewards WHERE stock > 0 ORDER BY point_required ASC') as any
    return NextResponse.json(rows)
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
