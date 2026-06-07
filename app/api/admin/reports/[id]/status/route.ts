import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import pool from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const auth = await requireSession(["ADMIN"]);
    if (auth.error) return auth.error;

    const body = await req.json();
    const { status } = body;

    if (!['REPORTED', 'ON_PROGRESS', 'COMPLETED'].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const [result] = await pool.execute(
      `UPDATE waste_reports SET status = ? WHERE id = ?`,
      [status, id]
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Status updated successfully" });
  } catch (error: any) {
    console.error("Error updating report status:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
