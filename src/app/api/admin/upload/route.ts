// File: src/app/api/admin/upload/route.ts

import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request): Promise<NextResponse> {
  // 1. Keamanan: Pastikan yang upload adalah admin
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  // 2. Ambil nama file dari header request
  const filename = request.headers.get('x-vercel-filename');
  if (!filename || !request.body) {
    return NextResponse.json({ message: 'Filename or file body is missing' }, { status: 400 });
  }

  try {
    // 3. Simpan file ke Vercel Blob
    const blob = await put(filename, request.body, {
      access: 'public', // Penting agar gambar bisa diakses publik
    });

    // 4. Kirim kembali URL gambar yang sudah tersimpan
    return NextResponse.json(blob);

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ message: 'Error uploading file' }, { status: 500 });
  }
}
