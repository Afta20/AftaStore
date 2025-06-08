// File: src/app/api/orders/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

// Interface untuk item yang diterima dari body request
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
    return NextResponse.json({ message: 'Unauthorized: Anda harus login untuk membuat pesanan.' }, { status: 401 });
  }
  const userId = token.id as string;

  try {
    const body = await req.json() as OrderRequestBody;
    const { cartItems, totalAmount, shippingAddress, customerNotes } = body;

    if (!cartItems || cartItems.length === 0 || totalAmount == null) {
      return NextResponse.json({ message: 'Keranjang belanja kosong atau data pesanan tidak lengkap.' }, { status: 400 });
    }

    // --- VALIDASI KRUSIAL DI BACKEND SEBELUM MEMBUAT PESANAN ---
    console.log('[API /api/orders] Data diterima dari frontend:', JSON.stringify(cartItems, null, 2));

    // 1. Ambil semua ID produk dari keranjang
    const productIds = cartItems.map(item => item.id);

    // 2. Cek database untuk semua produk ini sekaligus
    const productsInDb = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      select: {
        id: true,
        stock: true,
        title: true,
        imageUrl: true
      }
    });

    // 3. Validasi Keberadaan Produk
    if (productsInDb.length !== productIds.length) {
      // Jika jumlah produk yang ditemukan di DB tidak sama dengan jumlah yang diminta,
      // berarti ada ID produk yang tidak valid.
      const foundIds = new Set(productsInDb.map(p => p.id));
      const missingId = productIds.find(id => !foundIds.has(id));
      return NextResponse.json({ message: `Produk dengan ID ${missingId} tidak ditemukan. Mohon hapus produk tersebut dari keranjang dan coba lagi.` }, { status: 404 });
    }

    // 4. Validasi Stok Produk
    for (const item of cartItems) {
      const product = productsInDb.find(p => p.id === item.id);
      // Periksa apakah produk ditemukan dan stok mencukupi
      if (!product || product.stock < item.quantity) {
        return NextResponse.json({ message: `Stok untuk produk "${product?.title || item.title}" tidak mencukupi. Sisa stok: ${product?.stock ?? 0}.` }, { status: 400 });
      }
    }

    // --- TRANSAKSI ATOMIK UNTUK MEMBUAT PESANAN DAN MENGURANGI STOK ---
    // Jika salah satu langkah gagal, semua akan dibatalkan (rollback).
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

      return order;
    });

    return NextResponse.json({ message: 'Order created successfully', order: createdOrder }, { status: 201 });

  } catch (error: any) {
    console.error("Gagal membuat pesanan (catch block):", error);
    if (error.code === 'P2025') { 
        return NextResponse.json({ message: 'Salah satu produk di keranjang Anda tidak dapat ditemukan saat proses update.' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Terjadi kesalahan internal saat membuat pesanan.', error: error.message }, { status: 500 });
  }
}
