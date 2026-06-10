import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: filePathParams } = await params;
  
  // Amankan path dari directory traversal
  const safePath = filePathParams.join('/').replace(/\.\./g, '');
  const absolutePath = path.join(process.cwd(), 'uploads', safePath);

  try {
    const file = await fs.readFile(absolutePath);
    
    // Tentukan MIME type sederhana
    const ext = path.extname(absolutePath).toLowerCase();
    let mime = 'application/octet-stream';
    if (ext === '.jpg' || ext === '.jpeg') mime = 'image/jpeg';
    else if (ext === '.png') mime = 'image/png';
    else if (ext === '.webp') mime = 'image/webp';

    return new NextResponse(file, {
      headers: {
        'Content-Type': mime,
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  } catch (error) {
    return new NextResponse('File not found', { status: 404 });
  }
}
