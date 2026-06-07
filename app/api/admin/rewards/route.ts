import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import pool from "@/lib/db";

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

    const body = await req.json();
    const { name, category, point_required, stock, image } = body;

    if (!name || !category || point_required === undefined || stock === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [result] = await pool.execute(
      `INSERT INTO rewards (name, category, point_required, stock, image) VALUES (?, ?, ?, ?, ?)`,
      [name, category, point_required, stock, image || null]
    );

    return NextResponse.json({ message: "Reward created successfully", id: (result as any).insertId }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating reward:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
