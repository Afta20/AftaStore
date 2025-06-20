// File: src/app/api/categories/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// API ini tidak perlu dilindungi, karena pembeli perlu melihat daftar kategori untuk filter
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
      // Sertakan hitungan (count) dari produk yang berhubungan dengan setiap kategori
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('[GET_PUBLIC_CATEGORIES_ERROR]', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
