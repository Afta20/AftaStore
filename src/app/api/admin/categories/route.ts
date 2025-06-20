// File: src/app/api/admin/categories/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  // Keamanan: Pastikan hanya admin yang bisa mengakses
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc', // Urutkan berdasarkan nama
      },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('[GET_CATEGORIES_ERROR]', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}