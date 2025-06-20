// File: src/app/api/admin/products/route.ts (Versi Final Lengkap)

import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';
import { z } from 'zod';

// Skema validasi untuk produk baru menggunakan Zod
const createProductSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters long." }),
  price: z.number().positive({ message: "Price must be a positive number." }),
  stock: z.number().int().min(0, { message: "Stock must be a non-negative integer." }),
  imagePreviews: z.array(z.string()).optional(),
  description: z.string().optional().nullable(),
  categoryId: z.string().nullable().optional(),
});


// Fungsi GET untuk mengambil semua produk
export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Pengecekan role menggunakan 'admin' (huruf kecil)
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


// Fungsi POST untuk menambahkan produk baru
export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Pengecekan role menggunakan 'admin' (huruf kecil)
  if (!token || token.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    
    const validatedData = createProductSchema.parse(body);

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
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: `Invalid input: ${error.errors[0].message}` }, { status: 400 });
    }
    
    if (error.code === 'P2002' && error.meta?.target?.includes('title')) {
      return NextResponse.json({ message: 'Product title already exists.' }, { status: 409 });
    }

    console.error("Failed to add product:", error);
    return NextResponse.json({ message: 'Failed to add product', error: error.message }, { status: 500 });
  }
}