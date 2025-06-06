// File: src/app/api/admin/categories/route.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma'; // Sesuaikan path ke Prisma client Anda
import { getToken } from 'next-auth/jwt';

export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  // Akses ke kategori mungkin tidak perlu seketat admin,
  // tergantung kebutuhan Anda. Untuk dashboard, biasanya admin.
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