// Salin semua kode di bawah ini, dan gantikan seluruh isi file Anda.

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

interface CartItemForOrder {
  id: string;
  title: string;
  price: number;
  quantity: number;
}

interface OrderRequestBody {
  cartItems: CartItemForOrder[];
  totalAmount: number;
  shippingAddress?: string;
  customerNotes?: string;
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || !token.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const userId = token.id as string;

  try {
    const body = await req.json() as OrderRequestBody;
    const { cartItems, totalAmount, shippingAddress, customerNotes } = body;

    if (!cartItems || cartItems.length === 0 || totalAmount == null) {
      return NextResponse.json({ message: 'Data pesanan tidak lengkap.' }, { status: 400 });
    }

    const productIds = cartItems.map(item => item.id);

    const productsInDb = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        stock: true,
        title: true,
        imagePreviews: true,
      }
    });

    for (const item of cartItems) {
      const product = productsInDb.find(p => p.id === item.id);
      if (!product) {
        return NextResponse.json({ message: `Produk dengan nama "${item.title}" tidak ditemukan di database.` }, { status: 404 });
      }
      if (product.stock < item.quantity) {
        return NextResponse.json({ message: `Stok untuk produk "${product.title}" tidak mencukupi.` }, { status: 400 });
      }
    }

    const createdOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId: userId,
          totalAmount: totalAmount,
          status: 'PENDING',
          shippingAddress: shippingAddress || 'Alamat belum diisi',
          customerNotes: customerNotes || null,
          items: {
            create: cartItems.map(item => {
              const productData = productsInDb.find(p => p.id === item.id);
              const mainImage = (productData?.imagePreviews && productData.imagePreviews.length > 0) 
              ? productData.imagePreviews[0] 
              : null;
              return {
                productId: item.id,
                quantity: item.quantity,
                priceAtPurchase: item.price,
                  productNameSnapshot: productData?.title || item.title,
                  productImageSnapshot: mainImage,
              };
            }),
          },
        },
      });

      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.id },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return order;
    });

    return NextResponse.json({ message: 'Order created successfully', order: createdOrder }, { status: 201 });

  } catch (error: any) {
    console.error("Gagal membuat pesanan:", error);
    return NextResponse.json({ message: 'Terjadi kesalahan internal saat membuat pesanan.', error: error.message }, { status: 500 });
  }
}