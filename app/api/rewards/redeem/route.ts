import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'
import { requireSession } from '@/lib/session'

export async function POST(req: Request) {
  const { session, error } = await requireSession()
  if (error) return error
  const userId = (session.user as any).id

  try {
    const body = await req.json()
    const { reward_id } = body
    if (!reward_id) return NextResponse.json({ error: 'Missing reward_id' }, { status: 400 })

    // check reward
    const [rewardRows] = await pool.execute('SELECT id, point_required, stock, name FROM rewards WHERE id = ? LIMIT 1', [reward_id]) as any
    const reward = Array.isArray(rewardRows) ? rewardRows[0] : rewardRows
    if (!reward) return NextResponse.json({ error: 'Reward not found' }, { status: 404 })
    if (Number(reward.stock) <= 0) return NextResponse.json({ error: 'Out of stock' }, { status: 400 })

    // fetch user points
    const [userRows] = await pool.execute('SELECT points FROM users WHERE id = ? LIMIT 1', [userId]) as any
    const user = Array.isArray(userRows) ? userRows[0] : userRows
    const userPoints = Number(user?.points ?? 0)
    const required = Number(reward.point_required)
    if (userPoints < required) return NextResponse.json({ error: 'Insufficient points' }, { status: 400 })

    // perform updates
    await pool.execute('UPDATE rewards SET stock = stock - 1 WHERE id = ?', [reward_id])
    await pool.execute('UPDATE users SET points = points - ? WHERE id = ?', [required, userId])

    const txId = uuidv4()
    await pool.execute('INSERT INTO point_transactions (id, user_id, point_in, point_out, note, created_at) VALUES (?, ?, ?, ?, ?, NOW())', [txId, userId, 0, required, `Redeem ${reward.name}`])

    const [newUserRows] = await pool.execute('SELECT points FROM users WHERE id = ? LIMIT 1', [userId]) as any
    const newUser = Array.isArray(newUserRows) ? newUserRows[0] : newUserRows
    const remaining = Number(newUser?.points ?? 0)

    return NextResponse.json({ ok: true, remaining_points: remaining })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
