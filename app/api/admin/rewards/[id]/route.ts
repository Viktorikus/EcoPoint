import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import pool from "@/lib/db";
import { rewardSchema, validateBody } from "@/lib/validation";
import { promises as fs } from "fs";
import path from "path";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const auth = await requireSession(["ADMIN"]);
    if (auth.error) return auth.error;

    const { data, error } = await validateBody(rewardSchema, req);
    if (error) return error;

    const { name, category, pointRequired, stock, image } = data;

    const [result] = await pool.execute(
      `UPDATE rewards SET name = ?, category = ?, point_required = ?, stock = ?, image = ? WHERE id = ?`,
      [name, category, pointRequired, stock, image || null, id]
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

    // Ambil image path terlebih dahulu
    const [rows]: any = await pool.execute(`SELECT image FROM rewards WHERE id = ?`, [id]);
    if (rows.length === 0) {
       return NextResponse.json({ error: "Reward not found" }, { status: 404 });
    }
    const imagePath = rows[0].image;

    const [result] = await pool.execute(`DELETE FROM rewards WHERE id = ?`, [id]);

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: "Reward not found" }, { status: 404 });
    }

    // Hapus file dari disk jika path valid
    if (imagePath && imagePath.startsWith("/uploads/rewards/")) {
      try {
        const absolutePath = path.join(process.cwd(), imagePath);
        await fs.unlink(absolutePath);
      } catch (err) {
        console.error("Failed to delete image file:", err);
      }
    }

    return NextResponse.json({ message: "Reward deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting reward:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
