// File: src/app/api/orders/route.ts
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
    return NextResponse.json({ message: 'Unauthorized: User not logged in' }, { status: 401 });
  }
  const userId = token.id as string;

  try {
    const body = await req.json() as OrderRequestBody;
    const { cartItems, totalAmount, shippingAddress, customerNotes } = body;

    if (!cartItems || cartItems.length === 0 || totalAmount == null) {
      return NextResponse.json({ message: 'Missing required order data' }, { status: 400 });
    }

    // --- VALIDASI BARU DI BACKEND ---
    const productIds = cartItems.map(item => item.id);
    const productsInDb = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
    });

    // 1. Cek apakah semua produk ditemukan
    if (productsInDb.length !== productIds.length) {
      const foundIds = new Set(productsInDb.map(p => p.id));
      const missingId = productIds.find(id => !foundIds.has(id));
      return NextResponse.json({ message: `Produk dengan ID ${missingId} tidak ditemukan di database.` }, { status: 404 });
    }

    // 2. Cek ketersediaan stok
    for (const item of cartItems) {
      const product = productsInDb.find(p => p.id === item.id);
      if (!product || product.stock < item.quantity) {
        return NextResponse.json({ message: `Stok untuk produk "${item.title}" tidak mencukupi. Sisa stok: ${product?.stock ?? 0}.` }, { status: 400 });
      }
    }

    // --- TRANSAKSI YANG DIPERBARUI ---
    const createdOrder = await prisma.$transaction(async (tx) => {
      // Langkah A: Buat entri Order dan OrderItem
      const order = await tx.order.create({
        data: {
          userId: userId,
          totalAmount: totalAmount,
          status: 'PENDING',
          shippingAddress: shippingAddress || 'Alamat belum diisi',
          customerNotes: customerNotes || null,
          items: {
            create: cartItems.map(item => ({
              productId: item.id,
              quantity: item.quantity,
              priceAtPurchase: item.price,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // Langkah B: Kurangi stok untuk setiap produk
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.id },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return order; // Kembalikan pesanan yang sudah dibuat
    });

    return NextResponse.json({ message: 'Order created successfully', order: createdOrder }, { status: 201 });

  } catch (error: any) {
    console.error("Failed to create order:", error);
    // Error P2025: Terjadi jika stok menjadi negatif (jika ada constraint di DB) atau produk tidak ditemukan saat update
    if (error.code === 'P2025') { 
        return NextResponse.json({ message: 'Salah satu produk di keranjang tidak ditemukan saat proses akhir.' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Failed to create order', error: error.message }, { status: 500 });
  }
}
