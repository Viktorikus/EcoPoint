import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const auth = await requireSession(["ADMIN"]);
    if (auth.error) return auth.error;

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validasi MIME type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." }, { status: 400 });
    }

    // Validasi ukuran: maksimal 2MB
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size exceeds 2MB limit." }, { status: 400 });
    }

    // Convert file ke buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Ambil ekstensi
    let ext = path.extname(file.name);
    if (!ext) {
      if (file.type === "image/jpeg") ext = ".jpg";
      else if (file.type === "image/png") ext = ".png";
      else if (file.type === "image/webp") ext = ".webp";
    }
    
    // Buat nama file unik
    const filename = `reward-${crypto.randomUUID()}${ext}`;

    // Path folder uploads di root project (akan ter-mount di Docker)
    const uploadDir = path.join(process.cwd(), "uploads", "rewards");
    
    // Buat folder jika belum ada
    await fs.mkdir(uploadDir, { recursive: true });

    // Path file absolut
    const filepath = path.join(uploadDir, filename);
    
    // Tulis ke disk
    await fs.writeFile(filepath, buffer);

    // Kembalikan URL publik menggunakan API route yang baru dibuat
    return NextResponse.json({ url: `/api/uploads/rewards/${filename}` }, { status: 201 });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
