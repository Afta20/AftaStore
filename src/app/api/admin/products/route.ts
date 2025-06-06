// File: src/app/api/admin/products/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

// Fungsi GET untuk mengambil semua produk
export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || token.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const productsFromDb = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      // take: 100, // Sesuaikan jika Anda ingin paginasi atau batas jumlah
      select: {
        id: true,
        title: true,
        price: true,
        stock: true,
        imagePreviews: true,
        createdAt: true,
        categoryId: true, // Opsional, tapi berguna jika category bisa null
        category: {      // Ini akan menyertakan objek category
          select: {
            name: true,  // Hanya field nama dari kategori
          },
        },
      }
    });

    // Konversi tipe Decimal menjadi number sebelum mengirim respons
    const products = productsFromDb.map(p => ({
      ...p,
      price: Number(p.price),
      // Anda tidak perlu mengubah struktur p.category di sini,
      // karena frontend (interface ProductFromApi) sudah mengharapkan
      // category: { name: string } | null
    }));

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json({ message: 'Failed to fetch products' }, { status: 500 });
  }
}

// Fungsi POST untuk menambahkan produk baru (sudah ada dari sebelumnya)
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
    // Pastikan model Product di schema.prisma Anda memiliki field 'description' jika Anda menyertakannya di sini
    // Jika 'description' opsional dan bisa null, 'description || null' sudah benar.
    // Jika 'description' tidak ada di skema, hapus dari sini.
    const productData: any = {
        title,
        price: priceNumber,
        stock: stockNumber,
        imagePreviews: imagePreviews || [],
    };
    if (description !== undefined) { // Hanya sertakan deskripsi jika ada di body
        productData.description = description;
    }
    if (categoryId) {
        productData.category = { connect: { id: categoryId } };
    }


    const newProduct = await prisma.product.create({
      data: productData,
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    console.error("Failed to add product:", error);
    if (error.code === 'P2002' && error.meta?.target?.includes('title')) {
      return NextResponse.json({ message: 'Product title already exists.' }, { status: 409 });
    }
    // Tangani error jika 'description' tidak ada di model Product Prisma
    if (error.code === 'P2002' && error.message?.includes('description')) { // Contoh pengecekan error spesifik
        console.warn("Attempted to save 'description' but it might not exist in the Product model or has constraints.");
    }
    return NextResponse.json({ message: 'Failed to add product', error: error.message }, { status: 500 });
  }
}
