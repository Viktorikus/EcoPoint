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
      `SELECT id, user_id, photo, location, description, status, created_at
       FROM waste_reports
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
    // accept FormData (file upload)
    const form = await req.formData()
    const photo = form.get('photo') as File | null
    const location = String(form.get('location') ?? '')
    const description = String(form.get('description') ?? '')

    if (!photo) return NextResponse.json({ error: 'Photo required' }, { status: 400 })
    if (!location) return NextResponse.json({ error: 'Location required' }, { status: 400 })
    if (!description) return NextResponse.json({ error: 'Description required' }, { status: 400 })

    const id = uuidv4()
    const status = 'REPORTED'

    // save photo to public/uploads
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    await fs.mkdir(uploadsDir, { recursive: true })
    const contentType = photo.type || 'image/jpeg'
    const ext = contentType.split('/')?.[1] || 'jpg'
    const filename = `${id}.${ext}`
    const buffer = Buffer.from(await photo.arrayBuffer())
    const fullPath = path.join(uploadsDir, filename)
    await fs.writeFile(fullPath, buffer)
    const photoPath = `/uploads/${filename}`

    await pool.execute(
      'INSERT INTO waste_reports (id, user_id, photo, location, description, status, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [id, userId, photoPath, location, description, status]
    )

    return NextResponse.json({ ok: true, id }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
