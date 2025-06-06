// File: src/app/api/admin/products/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';

interface ApiOrderItem {
  id: string;
  productId: string;
  title: string;
  quantity: number;
  priceAtPurchase: number;
}

interface ApiUser {
  name?: string | null;
}

interface ApiOrderResponse { // Nama interface ini mungkin lebih cocok jika terkait order, tapi kita biarkan dulu
  id: string;
  createdAt: string;
  totalAmount: number;
  shippingAddress: string;
  customerNotes?: string | null;
  status: string;
  items: ApiOrderItem[];
  user?: ApiUser;
}

// --- GET Handler: Mengambil detail satu produk ---
export async function GET(
  request: NextRequest,
  context: { params?: { [key: string]: string | string[] | undefined } } // <-- PERUBAHAN SIGNATURE
) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const idParam = context.params?.id; // Ambil 'id', bukan 'orderId'

  if (typeof idParam !== 'string') {
    return NextResponse.json({ message: 'Product ID harus berupa string tunggal di path parameter' }, { status: 400 });
  }
  const productId: string = idParam;

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
  context: { params?: { [key: string]: string | string[] | undefined } } // <-- PERUBAHAN SIGNATURE
) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const idParam = context.params?.id; // Ambil 'id'

  if (typeof idParam !== 'string') {
    return NextResponse.json({ message: 'Product ID harus berupa string tunggal di path parameter' }, { status: 400 });
  }
  const productId: string = idParam;

  try {
    const body = await request.json();
    const {
      title, price, stock, imagePreviews, description, categoryId,
    } = body;

    if (!title || price == null || stock == null) {
      return NextResponse.json({ message: 'Title, Price, and Stock are required' }, { status: 400 });
    }
    const priceNumber = parseFloat(price);
    if (isNaN(priceNumber) || priceNumber < 0) {
        return NextResponse.json({ message: 'Price must be a valid non-negative number.' }, { status: 400 });
    }
    const stockNumber = parseInt(stock, 10);
    if (isNaN(stockNumber) || stockNumber < 0) {
        return NextResponse.json({ message: 'Stock must be a valid non-negative number.' }, { status: 400 });
    }

    const updateData: any = {
      title,
      price: priceNumber,
      stock: stockNumber,
      imagePreviews: imagePreviews || [],
      description: description || null,
    };

    if (categoryId) {
      updateData.category = { connect: { id: categoryId } };
    } else {
      updateData.category = { disconnect: true };
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
  context: { params?: { [key: string]: string | string[] | undefined } } // <-- PERUBAHAN SIGNATURE
) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const idParam = context.params?.id; // Ambil 'id'

  if (typeof idParam !== 'string') {
    return NextResponse.json({ message: 'Product ID harus berupa string tunggal di path parameter' }, { status: 400 });
  }
  const productId: string = idParam;

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