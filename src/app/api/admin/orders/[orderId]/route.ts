// File: src/app/api/admin/products/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';

// --- GET Handler: Mengambil detail satu produk ---
export async function GET(
  request: NextRequest,
  context: { params?: { id?: string | string[] } } // Tipe yang lebih aman
) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const productId = context.params?.id;

  if (typeof productId !== 'string') {
    return NextResponse.json({ message: 'Product ID harus berupa string tunggal' }, { status: 400 });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
      },
    });

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const responseProduct = {
      ...product,
      price: Number(product.price),
      discountedPrice: product.discountedPrice ? Number(product.discountedPrice) : null,
    };

    return NextResponse.json(responseProduct, { status: 200 });
  } catch (error) {
    console.error(`Failed to fetch product ${productId}:`, error);
    return NextResponse.json({ message: `Failed to fetch product: ${productId}` }, { status: 500 });
  }
}

// --- PUT Handler: Memperbarui produk yang ada ---
export async function PUT(
  request: NextRequest,
  context: { params?: { id?: string | string[] } } // <-- Perbaikan Signature
) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const productId = context.params?.id;

  if (typeof productId !== 'string') {
    return NextResponse.json({ message: 'Product ID harus berupa string tunggal' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const {
      title, price, stock, imagePreviews, description, categoryId, discountedPrice
    } = body;

    if (!title || price == null || stock == null) {
      return NextResponse.json({ message: 'Title, Price, and Stock are required' }, { status: 400 });
    }
    
    // Data untuk update
    const updateData: any = {
      title,
      price: parseFloat(price),
      stock: parseInt(stock, 10),
      imagePreviews: imagePreviews || [],
      description: description, // Asumsi field ini sudah ada di skema
    };
    
    // Handle koneksi kategori
    if (categoryId) {
      updateData.category = { connect: { id: categoryId } };
    } else {
      // Jika categoryId null/kosong, putuskan relasi jika ada
      updateData.category = { disconnect: true };
    }
    
    // Handle discountedPrice
    if (discountedPrice != null && discountedPrice > 0) {
        updateData.discountedPrice = parseFloat(discountedPrice);
    } else {
        updateData.discountedPrice = null; // Set null jika 0 atau tidak ada
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updateData,
    });

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error: any) {
    console.error(`Failed to update product ${productId}:`, error);
    if (error.code === 'P2025') {
        return NextResponse.json({ message: 'Product not found for update.' }, { status: 404 });
    }
    return NextResponse.json({ message: `Failed to update product: ${productId}`, error: error.message }, { status: 500 });
  }
}

// --- DELETE Handler: Menghapus produk ---
export async function DELETE(
  request: NextRequest,
  context: { params?: { id?: string | string[] } } // <-- Perbaikan Signature
) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const productId = context.params?.id;

  if (typeof productId !== 'string') {
    return NextResponse.json({ message: 'Product ID harus berupa string tunggal' }, { status: 400 });
  }

  try {
    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error(`Failed to delete product ${productId}:`, error);
    if (error.code === 'P2025') {
        return NextResponse.json({ message: 'Product not found for deletion.' }, { status: 404 });
    }
    if (error.code === 'P2003') {
        return NextResponse.json({ message: 'Cannot delete product. It is still referenced in existing orders.' }, { status: 409 });
    }
    return NextResponse.json({ message: `Failed to delete product: ${productId}`, error: error.message }, { status: 500 });
  }
}
