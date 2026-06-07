import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import pool from "@/lib/db";

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
      `SELECT user_id, point, status FROM waste_deposits WHERE id = ?`,
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

    // Update deposit status
    await connection.execute(
      `UPDATE waste_deposits SET status = ?, verified_by = ? WHERE id = ?`,
      [status, officerId, id]
    );

    // If verified, give points to user and log transaction
    if (status === 'VERIFIED') {
      await connection.execute(
        `UPDATE users SET points = points + ? WHERE id = ?`,
        [deposit.point, deposit.user_id]
      );

      await connection.execute(
        `INSERT INTO point_transactions (user_id, point_in, point_out, note) VALUES (?, ?, 0, ?)`,
        [deposit.user_id, deposit.point, `Verifikasi setoran sampah #${id}`]
      );
    }

    await connection.commit();
    connection.release();

    return NextResponse.json({ message: `Deposit ${status} successfully` });
  } catch (error: any) {
    await connection.rollback();
    connection.release();
    console.error("Error verifying deposit:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
