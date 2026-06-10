import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import pool from "@/lib/db";
import { calculatePoints, addPoints } from "@/lib/points";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const connection = await pool.getConnection();
  try {
    const auth = await requireSession(["PETUGAS", "ADMIN"]);
    if (auth.error) {
      connection.release();
      return auth.error;
    }

    const officerId = (auth.session.user as any).id;
    const body = await req.json();
    const { status } = body;

    if (!['VERIFIED', 'REJECTED'].includes(status)) {
      connection.release();
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    await connection.beginTransaction();

    const [deposits]: any = await connection.execute(
      `SELECT user_id, weight, category_id, status FROM waste_deposits WHERE id = ?`,
      [id]
    );

    if (deposits.length === 0) {
      await connection.rollback();
      connection.release();
      return NextResponse.json({ error: "Deposit not found" }, { status: 404 });
    }

    const deposit = deposits[0];

    if (deposit.status !== 'PENDING') {
      await connection.rollback();
      connection.release();
      return NextResponse.json({ error: "Deposit already processed" }, { status: 400 });
    }

    if (status === 'VERIFIED') {
      const [categories]: any = await connection.execute(
        `SELECT point_per_kg FROM waste_categories WHERE id = ?`,
        [deposit.category_id]
      );
      if (categories.length === 0) {
        throw new Error("Category not found");
      }
      
      const pointPerKg = Number(categories[0].point_per_kg);
      const calculatedPoints = calculatePoints(Number(deposit.weight), pointPerKg);

      // Update status & point di waste_deposits (mengabaikan input client)
      await connection.execute(
        `UPDATE waste_deposits SET status = ?, verified_by = ?, point = ? WHERE id = ?`,
        [status, officerId, calculatedPoints, id]
      );

      // Tambah points via secure lib
      await addPoints(deposit.user_id, calculatedPoints, `Verifikasi setoran sampah #${id}`, connection);
    } else {
      // Jika REJECTED, update status saja
      await connection.execute(
        `UPDATE waste_deposits SET status = ?, verified_by = ? WHERE id = ?`,
        [status, officerId, id]
      );
    }

    await connection.commit();
    connection.release();

    return NextResponse.json({ message: `Deposit ${status} successfully` });
  } catch (error: any) {
    await connection.rollback();
    connection.release();
    console.error("Error verifying deposit:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
