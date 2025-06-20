// File: src/app/api/products/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const productsFromDb = await prisma.product.findMany({
      // Menggunakan filter cerdas dari kode Anda
      where: {
        stock: {
          gt: 0, // Hanya produk yang stoknya lebih dari 0
        },
        status: "ACTIVE", // Hanya produk yang statusnya aktif
      },
      orderBy: {
        createdAt: 'desc',
      },
      // === PERUBAHAN UTAMA DI SINI ===
      // Menggunakan 'include' untuk mengambil data dari tabel Category yang terhubung
      include: {
        category: {
          select: {
            name: true, // Kita hanya butuh nama kategorinya
          },
        },
      },
    });

    // Konversi tipe data Decimal dan sesuaikan struktur untuk frontend
    const products = productsFromDb.map(p => ({
      ...p,
      price: Number(p.price),
      discountedPrice: p.discountedPrice ? Number(p.discountedPrice) : null,
      // 'category' object sudah otomatis disertakan dari 'include'
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
