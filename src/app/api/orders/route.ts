// File: src/app/api/orders/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

interface CartItemForOrder {
  id: string; // ID produk
  title: string;
  price: number; // Harga satuan produk saat itu
  quantity: number;
  // Properti lain dari item keranjang yang mungkin kamu kirim
}

interface OrderRequestBody {
  cartItems: CartItemForOrder[];
  totalAmount: number;
  shippingAddress?: string; // Opsional untuk sekarang
  customerNotes?: string;   // Opsional
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || !token.id) { // Pastikan token.id ada (user sudah login)
    return NextResponse.json({ message: 'Unauthorized: User not logged in or session invalid' }, { status: 401 });
  }
  const userId = token.id as string; // Ambil ID user dari token

  try {
    const body = await req.json() as OrderRequestBody;
    const { cartItems, totalAmount, shippingAddress, customerNotes } = body;

    if (!cartItems || cartItems.length === 0 || totalAmount == null) {
      return NextResponse.json({ message: 'Missing required order data (cart items, total amount)' }, { status: 400 });
    }

    // Buat entri Order dan OrderItem dalam satu transaksi Prisma
    const createdOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId: userId,
          totalAmount: totalAmount,
          status: 'PENDING', // Status awal
          shippingAddress: shippingAddress || 'Alamat belum diisi', // Default jika kosong
          customerNotes: customerNotes || null,
          items: {
            create: cartItems.map(item => ({
              productId: item.id, // ID produk dari item keranjang
              quantity: item.quantity,
              priceAtPurchase: item.price, // Harga satuan produk dari item keranjang
            })),
          },
        },
        include: {
          items: true, // Sertakan item yang baru dibuat dalam respons
        },
      });
      return order;
    });

    // Di sini kamu juga bisa menambahkan logika untuk mengosongkan keranjang belanja pengguna
    // (misalnya dengan memanggil API lain atau jika state keranjang ada di backend)
    // Untuk Redux di client, pengosongan keranjang dilakukan di client setelah order berhasil.

    return NextResponse.json({ message: 'Order created successfully', order: createdOrder }, { status: 201 });

  } catch (error: any) {
    console.error("Failed to create order:", error);
    // Cek error spesifik dari Prisma atau lainnya
    if (error.code === 'P2025') { // Contoh: Record to connect to not found (misal productId tidak valid)
        return NextResponse.json({ message: 'Invalid product data in cart.' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Failed to create order', error: error.message }, { status: 500 });
  }
}