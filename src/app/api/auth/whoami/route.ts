// File: src/app/api/auth/whoami/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth'; // Pastikan path ini benar

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    // Kembalikan seluruh objek sesi agar kita bisa memeriksanya
    return NextResponse.json(session, { status: 200 });

  } catch (error) {
    console.error("[WHOAMI_ERROR]", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}