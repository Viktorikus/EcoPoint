import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { requireSession } from '@/lib/session'
import { deductPoints } from '@/lib/points'

export async function POST(req: Request) {
  const { session, error } = await requireSession()
  if (error) return error
  const userId = (session.user as any).id

  const connection = await pool.getConnection()
  try {
    const body = await req.json()
    const { reward_id } = body
    if (!reward_id) {
      connection.release()
      return NextResponse.json({ error: 'Missing reward_id' }, { status: 400 })
    }

    await connection.beginTransaction()

    // 1. Lock reward row & cek stock
    const [rewardRows]: any = await connection.execute(
      'SELECT id, point_required, stock, name FROM rewards WHERE id = ? FOR UPDATE', 
      [reward_id]
    )
    if (rewardRows.length === 0) throw new Error('Reward not found')
    
    const reward = rewardRows[0]
    if (Number(reward.stock) <= 0) throw new Error('Out of stock')

    // 2. Idempotency Check (prevent double-click dalam 1 menit)
    const [recentTx]: any = await connection.execute(
      `SELECT id FROM point_transactions WHERE user_id = ? AND note = ? AND created_at > NOW() - INTERVAL 1 MINUTE`,
      [userId, `Redeem ${reward.name}`]
    )
    if (recentTx.length > 0) {
      throw new Error("Tunggu 1 menit sebelum menukar reward yang sama lagi")
    }

    // 3. Deduct points menggunakan secure lib (includes user lock & transaction insert)
    await deductPoints(userId, Number(reward.point_required), `Redeem ${reward.name}`, connection)

    // 4. Update stock
    await connection.execute('UPDATE rewards SET stock = stock - 1 WHERE id = ?', [reward_id])

    await connection.commit()
    connection.release()

    // Get latest points to return to client
    const [newUserRows]: any = await pool.execute('SELECT points FROM users WHERE id = ? LIMIT 1', [userId])
    const remaining = Number(newUserRows[0]?.points ?? 0)

    return NextResponse.json({ ok: true, remaining_points: remaining })
  } catch (e: any) {
    await connection.rollback()
    connection.release()
    console.error("Redeem error:", e)
    
    const status = (e.message === 'Reward not found') ? 404 : 400
    return NextResponse.json({ error: e.message || 'Server error' }, { status })
  }
}
