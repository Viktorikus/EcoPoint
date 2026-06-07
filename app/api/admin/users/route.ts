import { requireSession } from "@/lib/session"
import pool from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const result = await requireSession(["ADMIN"])
  if (result.error) return result.error

  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") || ""
    const role = searchParams.get("role") || ""

    const conn = await pool.getConnection()

    try {
      let query = `
        SELECT id, name, email, role, points, level, created_at,
               COALESCE(is_active, 1) as is_active
        FROM users
        WHERE 1=1
      `
      const params: any[] = []

      if (search) {
        query += " AND (name LIKE ? OR email LIKE ?)"
        params.push(`%${search}%`, `%${search}%`)
      }

      if (role && role !== "ALL") {
        query += " AND role = ?"
        params.push(role)
      }

      query += " ORDER BY created_at DESC"

      const [users]: any = await conn.query(query, params)
      conn.release()

      return NextResponse.json({ users })
    } catch (err) {
      conn.release()
      throw err
    }
  } catch (err: any) {
    console.error("Admin users fetch error:", err)
    return NextResponse.json({ error: "Gagal mengambil data users" }, { status: 500 })
  }
}
