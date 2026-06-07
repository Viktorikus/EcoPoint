import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import pool from "@/lib/db";

export async function GET(req: Request) {
  try {
    const auth = await requireSession(["ADMIN"]);
    if (auth.error) return auth.error;

    const [rows] = await pool.execute(
      `SELECT 
        r.id, 
        r.photo, 
        r.location, 
        r.description, 
        r.latitude, 
        r.longitude, 
        r.status, 
        r.created_at,
        u.name as user_name,
        u.email as user_email
      FROM waste_reports r
      JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC`
    );

    return NextResponse.json({ data: rows });
  } catch (error: any) {
    console.error("Error fetching admin reports:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
