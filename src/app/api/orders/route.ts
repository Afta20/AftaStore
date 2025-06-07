// File: src/app/api/orders/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

// Interface untuk data yang diterima dari frontend
interface CartItemForOrder {
  id: string; // ID produk (diasumsikan string CUID)
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
      return NextResponse.json({ message: 'Keranjang belanja kosong atau data tidak lengkap' }, { status: 400 });
    }

    // --- VALIDASI PENTING DI BACKEND ---

    // 1. Ambil semua productId dari keranjang
    const productIds = cartItems.map(item => item.id);

    // 2. Cek keberadaan dan stok semua produk tersebut di database dalam satu query
    const productsInDb = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      select: {
        id: true,
        stock: true,
        title: true,
      }
    });

    // 3. Validasi apakah semua produk ditemukan
    if (productsInDb.length !== productIds.length) {
      const foundIds = new Set(productsInDb.map(p => p.id));
      const missingId = productIds.find(id => !foundIds.has(id));
      // Kembalikan pesan error yang jelas jika ada produk yang tidak ditemukan
      return NextResponse.json({ message: `Produk dengan ID ${missingId} tidak ditemukan di database. Mungkin produk tersebut baru saja dihapus.` }, { status: 404 });
    }

    // 4. Validasi ketersediaan stok untuk setiap item
    for (const item of cartItems) {
      const product = productsInDb.find(p => p.id === item.id);
      // Cek jika produk ada dan stoknya mencukupi
      if (!product || product.stock < item.quantity) {
        return NextResponse.json({ message: `Stok untuk produk "${product?.title || item.title}" tidak mencukupi. Sisa stok: ${product?.stock ?? 0}.` }, { status: 400 });
      }
    }

    // --- TRANSAKSI YANG AMAN ---
    // Proses pembuatan pesanan dan pengurangan stok dilakukan dalam satu transaksi.
    // Jika salah satu gagal, semua akan dibatalkan (rollback).
    const createdOrder = await prisma.$transaction(async (tx) => {
      // Langkah A: Buat entri Order dan semua OrderItem-nya
      const order = await tx.order.create({
        data: {
          userId: userId,
          totalAmount: totalAmount,
          status: 'PENDING',
          shippingAddress: shippingAddress || 'Alamat belum diisi',
          customerNotes: customerNotes || null,
          items: {
            create: cartItems.map(item => ({
              productId: item.id, // Menyimpan ID CUID yang sudah divalidasi
              quantity: item.quantity,
              priceAtPurchase: item.price,
            })),
          },
        },
      });

      // Langkah B: Kurangi stok untuk setiap produk yang dibeli
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.id },
          data: {
            stock: {
              decrement: item.quantity, // Mengurangi stok sesuai kuantitas
            },
          },
        });
      }

      return order; // Kembalikan pesanan yang berhasil dibuat
    });

    return NextResponse.json({ message: 'Order created successfully', order: createdOrder }, { status: 201 });

  } catch (error: any) {
    console.error("Failed to create order:", error);
    // Menangani error jika ada masalah tak terduga selama transaksi
    return NextResponse.json({ message: 'Failed to create order', error: error.message }, { status: 500 });
  }
}
