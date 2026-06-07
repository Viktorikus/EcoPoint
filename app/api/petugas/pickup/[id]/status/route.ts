import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import pool from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const auth = await requireSession(["ADMIN", "PETUGAS"]);
    if (auth.error) return auth.error;

    const body = await req.json();
    const { status } = body;

    if (!['WAITING', 'SCHEDULED', 'ON_THE_WAY', 'DONE'].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const [result] = await pool.execute(
      `UPDATE pickup_requests SET status = ? WHERE id = ?`,
      [status, id]
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: "Pickup request not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, status });
  } catch (error: any) {
    console.error("Error updating pickup status:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
