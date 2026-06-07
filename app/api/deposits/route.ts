import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'
import { requireSession } from '@/lib/session'
import fs from 'fs/promises'
import path from 'path'

export async function GET(req: Request) {
  const { session, error } = await requireSession()
  if (error) return error
  const userId = (session.user as any).id

  try {
    const [rows] = await pool.execute(
      `SELECT wd.id, wd.user_id, wd.category_id, wd.weight, wd.point, wd.photo, wd.status, wd.created_at,
              wc.name AS category_name, wc.point_per_kg
       FROM waste_deposits wd
       LEFT JOIN waste_categories wc ON wd.category_id = wc.id
       WHERE wd.user_id = ?
       ORDER BY wd.created_at DESC`,
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
    const { category_id, weight, photo } = body
    if (!category_id || !weight) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    // fetch category to get point_per_kg
    const [catRows] = await pool.execute('SELECT point_per_kg FROM waste_categories WHERE id = ? LIMIT 1', [category_id]) as any
    const category = Array.isArray(catRows) ? catRows[0] : catRows
    if (!category) return NextResponse.json({ error: 'Invalid category' }, { status: 400 })

    const weightNum = Number(weight)
    const pointPerKg = Number(category.point_per_kg) || 0
    const point = Math.round(weightNum * pointPerKg)

    const id = uuidv4()
    const status = 'PENDING'

    let photoPath: string | null = null
    if (photo && typeof photo === 'string' && photo.startsWith('data:')) {
      // save base64 image to public/uploads
      const matches = photo.match(/^data:(.+);base64,(.+)$/)
      if (matches) {
        const ext = matches[1].split('/')[1] || 'jpg'
        const data = matches[2]
        const buffer = Buffer.from(data, 'base64')
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
        await fs.mkdir(uploadsDir, { recursive: true })
        const filename = `${id}.${ext}`
        const fullPath = path.join(uploadsDir, filename)
        await fs.writeFile(fullPath, buffer)
        photoPath = `/uploads/${filename}`
      }
    }

    await pool.execute(
      'INSERT INTO waste_deposits (id, user_id, category_id, weight, point, photo, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      [id, userId, category_id, weightNum, point, photoPath, status]
    )

    // update user points
    await pool.execute('UPDATE users SET points = COALESCE(points,0) + ? WHERE id = ?', [point, userId])

    return NextResponse.json({ ok: true, id }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
