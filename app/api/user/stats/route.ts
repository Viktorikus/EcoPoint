import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import pool from '../../../../lib/db'

const SECRET = process.env.NEXTAUTH_SECRET

export async function GET(req: Request) {
  const url = new URL(req.url)
  const token = await getToken({ req: (req as any), secret: SECRET })
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (token as any).id

  try {
    const [userRows] = await pool.execute('SELECT points, level FROM users WHERE id = ? LIMIT 1', [userId]) as any
    const user = Array.isArray(userRows) ? userRows[0] : userRows

    const [sumRows] = await pool.execute(
      "SELECT COALESCE(SUM(weight),0) AS total_weight FROM waste_deposits WHERE user_id = ? AND status = 'VERIFIED'",
      [userId]
    ) as any
    const totalWeight = Array.isArray(sumRows) ? sumRows[0].total_weight : sumRows.total_weight

    return NextResponse.json({ points: user?.points ?? 0, level: user?.level ?? 1, totalWasteKg: Number(totalWeight) })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
