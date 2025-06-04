// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Sesuaikan path jika perlu

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      // Anda bisa tambahkan orderBy, include untuk kategori, dll. jika perlu
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json({ message: "Failed to fetch products" }, { status: 500 });
  }
}