// File: src/app/api/admin/products/route.ts (Versi Final dengan Validasi Zod)

import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';
import { z } from 'zod'; // <-- Import Zod

// Skema validasi untuk produk baru menggunakan Zod
const createProductSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters long." }),
  price: z.number().positive({ message: "Price must be a positive number." }),
  stock: z.number().int().min(0, { message: "Stock must be a non-negative integer." }),
  imagePreviews: z.array(z.string()).optional(), // Array of strings, URL check bisa ditambahkan jika perlu
  description: z.string().optional().nullable(),
  categoryId: z.string().nullable().optional(),
});


// Fungsi GET Anda sudah bagus, tidak perlu diubah
export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Menggunakan 'admin' (huruf kecil) sesuai kode asli Anda di file ini
  if (!token || token.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const productsFromDb = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        price: true,
        stock: true,
        imagePreviews: true,
        createdAt: true,
        categoryId: true,
        category: {
          select: {
            name: true,
          },
        },
      }
    });

    const products = productsFromDb.map(p => ({
      ...p,
      price: Number(p.price),
    }));

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json({ message: 'Failed to fetch products' }, { status: 500 });
  }
}


// === FUNGSI POST YANG DISEMPURNAKAN DENGAN ZOD ===
export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || token.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    
    // 1. Validasi body request menggunakan skema Zod
    const validatedData = createProductSchema.parse(body);

    // 2. Buat produk baru dengan data yang sudah tervalidasi
    const newProduct = await prisma.product.create({
      data: {
        title: validatedData.title,
        price: validatedData.price,
        stock: validatedData.stock,
        description: validatedData.description,
        imagePreviews: validatedData.imagePreviews,
        ...(validatedData.categoryId && {
          category: {
            connect: {
              id: validatedData.categoryId,
            },
          },
        }),
      },
    });

    return NextResponse.json(newProduct, { status: 201 });

  } catch (error: any) {
    // 3. Penanganan error yang lebih baik
    if (error instanceof z.ZodError) {
      // Jika error karena validasi Zod gagal
      return NextResponse.json({ message: `Invalid input: ${error.errors[0].message}` }, { status: 400 });
    }
    
    if (error.code === 'P2002' && error.meta?.target?.includes('title')) {
      // Jika error karena judul produk sudah ada (unique constraint)
      return NextResponse.json({ message: 'Product title already exists.' }, { status: 409 });
    }

    console.error("Failed to add product:", error);
    return NextResponse.json({ message: 'Failed to add product', error: error.message }, { status: 500 });
  }
}