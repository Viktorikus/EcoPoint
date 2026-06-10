import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import pool from "@/lib/db";
import { rewardSchema, validateBody } from "@/lib/validation";

export async function GET(req: Request) {
  try {
    const auth = await requireSession(["ADMIN"]);
    if (auth.error) return auth.error;

    const [rows] = await pool.execute(`SELECT * FROM rewards ORDER BY id DESC`);
    return NextResponse.json({ data: rows });
  } catch (error: any) {
    console.error("Error fetching rewards:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireSession(["ADMIN"]);
    if (auth.error) return auth.error;

    const { data, error } = await validateBody(rewardSchema, req);
    if (error) return error;

    const { name, category, pointRequired, stock, image } = data;

    const [result] = await pool.execute(
      `INSERT INTO rewards (name, category, point_required, stock, image) VALUES (?, ?, ?, ?, ?)`,
      [name, category, pointRequired, stock, image || null]
    );

    return NextResponse.json({ message: "Reward created successfully", id: (result as any).insertId }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating reward:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
