import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import pool from "@/lib/db";

export async function GET(req: Request) {
  try {
    const auth = await requireSession(["ADMIN", "PETUGAS"]);
    if (auth.error) return auth.error;

    const url = new URL(req.url);
    const status = url.searchParams.get("status");

    let query = `
      SELECT pr.id, pr.address, pr.scheduled_at, pr.status, pr.notes, pr.created_at,
             u.name as user_name, u.phone as user_phone, u.address as user_address
      FROM pickup_requests pr
      JOIN users u ON pr.user_id = u.id
    `;
    const params: any[] = [];

    if (status && status !== "ALL") {
      query += ` WHERE pr.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY pr.scheduled_at ASC`;

    const [rows] = await pool.execute(query, params);

    return NextResponse.json({ data: rows });
  } catch (error: any) {
    console.error("Error fetching pickup requests:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
