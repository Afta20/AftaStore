// File: src/app/api/admin/upload/route.ts

import { put } from '@vercel/blob';
import { NextResponse, NextRequest } from 'next/server'; // <-- Impor NextRequest
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest): Promise<NextResponse> { // <-- Gunakan NextRequest
  // 1. Keamanan (sudah berfungsi dengan baik)
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  // 2. Ambil nama file dari query parameter URL
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename'); // <-- PERUBAHAN DI SINI

  // 3. Validasi
  if (!filename || !request.body) {
    return NextResponse.json(
      { message: 'Filename (as query param) or file body is missing' },
      { status: 400 }
    );
  }

  try {
    // 4. Simpan file ke Vercel Blob
    const blob = await put(filename, request.body, {
      access: 'public',
    });

    // 5. Kirim kembali URL gambar yang sudah tersimpan
    return NextResponse.json(blob);

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ message: 'Error uploading file' }, { status: 500 });
  }
}
