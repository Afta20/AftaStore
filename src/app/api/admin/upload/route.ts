// File: src/app/api/admin/upload/route.ts (Diperbarui)

import { put } from '@vercel/blob';
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename || !request.body) {
    return NextResponse.json(
      { message: 'Filename (as query param) or file body is missing' },
      { status: 400 }
    );
  }

  try {
    // === PERUBAHAN DI SINI: Tambahkan opsi addRandomSuffix ===
    const blob = await put(filename, request.body, {
      access: 'public',
      addRandomSuffix: true, // Otomatis buat nama file unik jika sudah ada
    });

    return NextResponse.json(blob);

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ message: 'Error uploading file' }, { status: 500 });
  }
}