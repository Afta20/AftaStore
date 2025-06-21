// File: src/app/api/admin/products/[productId]/route.ts

import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// Skema validasi untuk data update produk
const productUpdateSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  price: z.number().positive("Price must be a positive number."),
  discountedPrice: z.number().positive().nullable().optional(),
  stock: z.number().int().min(0, "Stock must be a non-negative number."),
  imagePreviews: z.array(z.string().url()).optional(),
  description: z.string().optional().nullable(),
  categoryId: z.string().nullable().optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED']).optional(),
});

// Helper function untuk mengambil ID dari URL, menghindari bug build Vercel
const getProductIdFromRequest = (req: NextRequest): string | null => {
    const segments = req.nextUrl.pathname.split('/');
    return segments.pop() || null;
}

/**
 * GET: Mengambil detail satu produk untuk halaman edit.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const productId = getProductIdFromRequest(req);
    if (!productId) {
      return NextResponse.json({ message: 'Product ID is missing.' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { category: true },
    });

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }
    
    const responseProduct = {
      ...product,
      price: Number(product.price),
      discountedPrice: product.discountedPrice ? Number(product.discountedPrice) : null,
    };
    return NextResponse.json(responseProduct);

  } catch (error) {
    console.error(`[GET_PRODUCT_ERROR]`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PUT: Memperbarui detail produk setelah diedit.
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const productId = getProductIdFromRequest(req);
    if (!productId) {
      return NextResponse.json({ message: 'Product ID is missing.' }, { status: 400 });
    }

    const body = await req.json();
    // `.partial()` membuat semua field di skema menjadi opsional, cocok untuk update
    const validatedData = productUpdateSchema.partial().parse(body);

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        ...validatedData,
        // Logika khusus untuk menghubungkan atau memutuskan hubungan kategori
        ...(validatedData.categoryId !== undefined && {
            category: validatedData.categoryId 
                ? { connect: { id: validatedData.categoryId } } 
                : { disconnect: true }
        })
      },
    });
    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: `Invalid input: ${error.errors[0].message}` }, { status: 400 });
    }
    console.error(`[PUT_PRODUCT_ERROR]`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}


/**
 * PATCH: Mengubah status produk (mengarsipkan atau mengaktifkan kembali).
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    
    const productId = getProductIdFromRequest(req);
    if (!productId) {
      return NextResponse.json({ message: 'Product ID is missing.' }, { status: 400 });
    }

    const body = await req.json();
    const { status } = body;

    // Validasi bahwa status yang dikirim adalah salah satu dari dua nilai yang diizinkan
    if (!status || (status !== 'ACTIVE' && status !== 'ARCHIVED')) {
      return NextResponse.json({ message: 'Invalid status. Must be ACTIVE or ARCHIVED.' }, { status: 400 });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { status: status },
    });

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error: any) {
     if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Error: Product not found.' }, { status: 404 });
    }
    console.error(`[PATCH_PRODUCT_ERROR]`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
