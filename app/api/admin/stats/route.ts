import { requireSession } from "@/lib/session"
import pool from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const result = await requireSession(["ADMIN"])
  if (result.error) return result.error

  try {
    const conn = await pool.getConnection()

    try {
      // 1. Total users (role = USER)
      const [totalUsersRows]: any = await conn.query(
        "SELECT COUNT(*) as count FROM users WHERE role = ?"
        , ["USER"]
      )
      const totalUsers = totalUsersRows[0]?.count || 0

      // 2. Total sampah terverifikasi (kg)
      const [totalWasteRows]: any = await conn.query(
        "SELECT SUM(weight) as total FROM waste_deposits WHERE status = ?"
        , ["VERIFIED"]
      )
      const totalWaste = totalWasteRows[0]?.total || 0

      // 3. Total laporan
      const [totalReportsRows]: any = await conn.query(
        "SELECT COUNT(*) as count FROM waste_reports"
      )
      const totalReports = totalReportsRows[0]?.count || 0

      // 4. Total poin terdistribusi
      const [totalPointsRows]: any = await conn.query(
        "SELECT SUM(point_in) as total FROM point_transactions"
      )
      const totalPoints = totalPointsRows[0]?.total || 0

      // 5. 5 setoran terbaru
      const [recentDeposits]: any = await conn.query(
        `SELECT wd.id, wd.user_id, wd.category_id, wd.weight, wd.point, wd.status, wd.created_at,
                u.name as user_name, wc.name as category_name
         FROM waste_deposits wd
         JOIN users u ON wd.user_id = u.id
         JOIN waste_categories wc ON wd.category_id = wc.id
         ORDER BY wd.created_at DESC
         LIMIT 5`
      )

      // 6. Sampah per bulan (6 bulan terakhir)
      const [monthlyWaste]: any = await conn.query(
        `SELECT MONTH(created_at) as month, YEAR(created_at) as year, SUM(weight) as total
         FROM waste_deposits
         WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
         GROUP BY YEAR(created_at), MONTH(created_at)
         ORDER BY year ASC, month ASC`
      )

      conn.release()

      return NextResponse.json({
        totalUsers,
        totalWaste: Number(totalWaste),
        totalReports,
        totalPoints: Number(totalPoints),
        recentDeposits,
        monthlyWaste,
      })
    } catch (err) {
      conn.release()
      throw err
    }
  } catch (err: any) {
    console.error("Admin stats error:", err)
    return NextResponse.json({ error: "Gagal mengambil statistik" }, { status: 500 })
  }
}
