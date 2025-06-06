// File: src/app/api/admin/products/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

// Fungsi GET untuk mengambil semua produk (untuk halaman Manage Products)
export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || token.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const productsFromDb = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      // take: 100, // Anda bisa mengatur jumlah produk yang diambil
      select: {
        id: true,
        title: true,
        price: true,
        stock: true,
        imagePreviews: true,
        createdAt: true,
        categoryId: true,
        category: { // <-- TAMBAHKAN BAGIAN INI
          select: {
            name: true, // Ambil nama kategori
          },
        },
      }
    });

    // Transformasi data, terutama konversi Decimal ke number
    const products = productsFromDb.map(p => ({
      ...p,
      price: Number(p.price), // Konversi Decimal ke number
      // Jika category ada, field category akan berisi { name: 'Nama Kategori' }
      // Jika tidak, category akan null
    }));

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json({ message: 'Failed to fetch products' }, { status: 500 });
  }
}

// Fungsi POST untuk menambahkan produk baru (sudah menyertakan stock)
export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || token.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, price, stock, imagePreviews, description, categoryId } = body;

    if (!title || price == null || stock == null) {
      return NextResponse.json({ message: 'Title, Price, and Stock are required' }, { status: 400 });
    }

    const stockNumber = parseInt(stock, 10);
    if (isNaN(stockNumber) || stockNumber < 0) {
        return NextResponse.json({ message: 'Stock must be a valid non-negative number.' }, { status: 400 });
    }
    const priceNumber = parseFloat(price);
     if (isNaN(priceNumber) || priceNumber < 0) {
        return NextResponse.json({ message: 'Price must be a valid non-negative number.' }, { status: 400 });
    }


    const newProduct = await prisma.product.create({
      data: {
        title,
        price: priceNumber,
        stock: stockNumber,
        imagePreviews: imagePreviews || [],
        description: description || null, // Pastikan model Product di schema.prisma punya field description
        ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    console.error("Failed to add product:", error);
    if (error.code === 'P2002' && error.meta?.target?.includes('title')) {
      return NextResponse.json({ message: 'Product title already exists.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Failed to add product', error: error.message }, { status: 500 });
  }
}
