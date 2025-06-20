// File: src/app/api/admin/upload/route.ts

import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  
  // === PERUBAHAN DI SINI ===
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const filename = request.headers.get('x-vercel-filename');
  if (!filename || !request.body) {
    return NextResponse.json({ message: 'Filename or file body is missing' }, { status: 400 });
  }

  try {
    const blob = await put(filename, request.body, { access: 'public' });
    return NextResponse.json(blob);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ message: 'Error uploading file' }, { status: 500 });
  }
}