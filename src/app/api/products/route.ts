// File: src/app/api/products/route.ts (Versi Final)

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const productsFromDb = await prisma.product.findMany({
      where: {
        stock: {
          gt: 0, // Hanya tampilkan produk yang stoknya lebih dari 0
        },
        status: "ACTIVE", // Hanya tampilkan produk yang statusnya aktif
      },
      orderBy: {
        createdAt: 'desc',
      },
      // Memilih field sesuai dengan schema.prisma Anda
      select: {
        id: true,
        title: true,         // Sesuai dengan skema
        price: true,
        discountedPrice: true, // Sesuai dengan skema
        imagePreviews: true,   // Sesuai dengan skema
      },
    });

    // Konversi tipe data Decimal dan sesuaikan struktur untuk frontend
    const products = productsFromDb.map(p => ({
      ...p,
      price: Number(p.price),
      discountedPrice: p.discountedPrice ? Number(p.discountedPrice) : null,
    }));

    return NextResponse.json(products);

  } catch (error) {
    console.error("Public API - Failed to fetch products:", error);
    return new NextResponse(
      JSON.stringify({ message: "Gagal memuat produk" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}