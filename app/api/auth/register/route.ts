import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { registerSchema, validateBody, sanitizeString } from '@/lib/validation'

export async function POST(req: Request) {
  try {
    const { data, error } = await validateBody(registerSchema, req)
    if (error) return error

    const { name, email, password, phone, address } = data!

    // Cek duplikat menggunakan Prisma
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true }
    })
    
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    // Hash dengan bcrypt (rounds 12)
    const hashed = await bcrypt.hash(password, 12)

    // Simpan ke DB pakai Prisma, sanitize inputs
    const user = await prisma.user.create({
      data: {
        name: sanitizeString(name),
        email: email.toLowerCase().trim(),
        password: hashed,
        phone: phone ? sanitizeString(phone) : null,
        address: address ? sanitizeString(address) : null,
        role: 'USER',
        points: 0,
        level: 1
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true
      }
    })

    return NextResponse.json({ ok: true, user }, { status: 201 })
  } catch (e: any) {
    console.error("Registration error:", e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
