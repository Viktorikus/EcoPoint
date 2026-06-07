import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import pool from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const auth = await requireSession(["ADMIN"]);
    if (auth.error) return auth.error;

    const body = await req.json();
    const { name, category, point_required, stock, image } = body;

    const [result] = await pool.execute(
      `UPDATE rewards SET name = ?, category = ?, point_required = ?, stock = ?, image = ? WHERE id = ?`,
      [name, category, point_required, stock, image || null, id]
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: "Reward not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Reward updated successfully" });
  } catch (error: any) {
    console.error("Error updating reward:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const auth = await requireSession(["ADMIN"]);
    if (auth.error) return auth.error;

    const [result] = await pool.execute(`DELETE FROM rewards WHERE id = ?`, [id]);

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: "Reward not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Reward deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting reward:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
