// File: src/app/api/admin/products/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

// Fungsi GET yang sudah ada (untuk mengambil semua produk)
export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || token.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
            take: 10,
      select: { // Hanya ambil field yang dibutuhkan untuk daftar
    id: true,
    title: true,
    price: true,
    imagePreviews: true, // Ambil hanya gambar pertama jika cukup
    createdAt: true,
  }
    });
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json({ message: 'Failed to fetch products' }, { status: 500 });
  }
}

// Fungsi POST BARU untuk menambahkan produk
export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || token.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, price, imagePreviews, description, categoryId } = body;

    if (!title || price == null) { // Cek price juga
      return NextResponse.json({ message: 'Title and Price are required' }, { status: 400 });
    }

    // Validasi lebih lanjut bisa ditambahkan di sini (misalnya, tipe data)

    const newProduct = await prisma.product.create({
      data: {
        title,
        price: parseFloat(price), // Pastikan price adalah angka
        imagePreviews: imagePreviews || [], // Default ke array kosong jika tidak ada
        description: description || null,
        // Hubungkan ke kategori jika categoryId ada
        ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
        // reviews, discountedPrice bisa diatur default atau ditambahkan nanti
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    console.error("Failed to add product:", error);
    if (error.code === 'P2002' && error.meta?.target?.includes('title')) { // Contoh jika title harus unik
        return NextResponse.json({ message: 'Product title already exists.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Failed to add product', error: error.message }, { status: 500 });
  }
}

