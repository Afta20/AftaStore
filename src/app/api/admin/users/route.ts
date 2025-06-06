// File: src/app/api/admin/users/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Pastikan path ini benar
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || token.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
      // Kamu bisa memilih field mana saja yang mau diambil
      // select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json({ message: 'Failed to fetch users' }, { status: 500 });
  }
}