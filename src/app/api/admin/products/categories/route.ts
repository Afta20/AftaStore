// File: src/app/api/admin/categories/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Hanya admin yang boleh mengakses daftar kategori (sesuaikan jika perlu)
  if (!token || token.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc', // Urutkan berdasarkan nama
      },
      select: {
        id: true,
        name: true,
      },
    });
    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json({ message: 'Failed to fetch categories' }, { status: 500 });
  }
}