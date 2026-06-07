import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import pool from "@/lib/db";

export async function GET(req: Request) {
  try {
    const auth = await requireSession(["ADMIN"]);
    if (auth.error) return auth.error;

    const [rows] = await pool.execute(
      `SELECT 
        d.id, 
        d.weight, 
        d.point, 
        d.photo, 
        d.status, 
        d.created_at,
        u.name as user_name,
        u.email as user_email,
        c.name as category_name
      FROM waste_deposits d
      JOIN users u ON d.user_id = u.id
      JOIN waste_categories c ON d.category_id = c.id
      ORDER BY d.created_at DESC`
    );

    return NextResponse.json({ data: rows });
  } catch (error: any) {
    console.error("Error fetching admin deposits:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
