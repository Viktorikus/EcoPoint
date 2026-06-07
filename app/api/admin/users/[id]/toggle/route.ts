import { requireSession } from "@/lib/session"
import pool from "@/lib/db"
import { NextResponse } from "next/server"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireSession(["ADMIN"])
  if (result.error) return result.error

  try {
    const userId = id
    const conn = await pool.getConnection()

    try {
      // Toggle is_active
      const [user]: any = await conn.query("SELECT is_active FROM users WHERE id = ?", [userId])
      if (!user || user.length === 0) {
        conn.release()
        return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 })
      }

      const newStatus = !user[0].is_active
      await conn.query("UPDATE users SET is_active = ? WHERE id = ?", [newStatus, userId])

      conn.release()
      return NextResponse.json({ success: true, is_active: newStatus })
    } catch (err) {
      conn.release()
      throw err
    }
  } catch (err: any) {
    console.error("Admin user toggle error:", err)
    return NextResponse.json({ error: "Gagal mengubah status user" }, { status: 500 })
  }
}
