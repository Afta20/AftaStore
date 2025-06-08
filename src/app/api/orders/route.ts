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

    // 1. Ambil semua ID produk dari keranjang
    const productIds = cartItems.map(item => item.id);

    // 2. Cek database untuk semua produk ini, TERMASUK imageUrl
    const productsInDb = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      select: {
        id: true,
        stock: true,
        title: true,
        imageUrl: true, // Pastikan imageUrl diambil
      }
    });

    // 3 & 4. Validasi Keberadaan & Stok Produk (Kode Anda sudah benar)
    if (productsInDb.length !== productIds.length) {
      const foundIds = new Set(productsInDb.map(p => p.id));
      const missingId = productIds.find(id => !foundIds.has(id));
      return NextResponse.json({ message: `Produk dengan ID ${missingId} tidak ditemukan.` }, { status: 404 });
    }
    for (const item of cartItems) {
      const product = productsInDb.find(p => p.id === item.id);
      if (!product || product.stock < item.quantity) {
        return NextResponse.json({ message: `Stok untuk produk "${product?.title || item.title}" tidak mencukupi.` }, { status: 400 });
      }
    }

    // --- TRANSAKSI ATOMIK UNTUK MEMBUAT PESANAN DAN MENGURANGI STOK ---
    const createdOrder = await prisma.$transaction(async (tx) => {
      // Langkah A: Buat entri Order dan OrderItem
      const order = await tx.order.create({
        data: {
          userId: userId,
          totalAmount: totalAmount,
          status: 'PENDING',
          shippingAddress: shippingAddress || 'Alamat belum diisi',
          customerNotes: customerNotes || null,
          
          // ==========================================================
          // ===             INILAH BAGIAN YANG DIPERBAIKI          ===
          // ==========================================================
          items: {
            create: cartItems.map(item => {
              // Cari data produk yang relevan dari hasil query di atas
              const productData = productsInDb.find(p => p.id === item.id);
              
              // Kembalikan objek lengkap untuk disimpan di OrderItem
              return {
                productId: item.id,
                quantity: item.quantity,
                priceAtPurchase: item.price,
                  // Simpan data "snapshot" di sini
                  productNameSnapshot: productData?.title || item.title,
                  productImageSnapshot: productData?.imageUrl || null,
              };
            }),
          },
          // ==========================================================
        },
      });

      // Langkah B: Kurangi stok untuk setiap produk yang dibeli
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
    console.error("Gagal membuat pesanan (catch block):", error);
    // Hapus error handling spesifik P2025 karena tidak relevan lagi dengan struktur baru
    return NextResponse.json({ message: 'Terjadi kesalahan internal saat membuat pesanan.', error: error.message }, { status: 500 });
  }
}