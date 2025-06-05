// File: src/app/api/orders/[orderId]/route.ts

import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma'; // Sesuaikan path ke Prisma client Anda
import { getToken } from 'next-auth/jwt'; // Untuk otentikasi jika diperlukan

// Definisikan tipe yang diharapkan oleh frontend (mirip dengan yang ada di halaman konfirmasi)
// Ini membantu memastikan konsistensi data, meskipun tidak wajib di backend.
interface ApiOrderItem {
  id: string;
  productId: string;
  title: string;
  quantity: number;
  priceAtPurchase: number;
}

interface ApiUser {
  name?: string | null;
  // email?: string | null; // Jika Anda juga ingin mengirim email
}

interface ApiOrderResponse {
  id: string;
  createdAt: string;
  totalAmount: number;
  shippingAddress: string;
  customerNotes?: string | null;
  status: string;
  items: ApiOrderItem[];
  user?: ApiUser;
}

export async function GET(
  request: NextRequest,
  context: { params?: { [key: string]: string | string[] | undefined } }
) {
  const { orderId } = context.params; 

  if (!orderId) {
    return NextResponse.json({ message: 'Order ID tidak disediakan' }, { status: 400 });
  }

  // Opsional: Otentikasi & Otorisasi
  // Pastikan hanya pengguna yang login dan berhak yang bisa melihat order ini.
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !token.sub) { // token.sub biasanya berisi userId
    return NextResponse.json({ message: 'Tidak Terautentikasi' }, { status: 401 });
  }

  try {
    const orderFromDb = await prisma.order.findUnique({
      where: {
        id: orderId,
        userId: token.sub,
      },
      include: {
        items: { // Ambil item-item dalam pesanan
          select: {
            id: true,         // ID OrderItem
            productId: true,
            quantity: true,
            priceAtPurchase: true, // Ini adalah Decimal dari DB
            product: {         // Ambil produk terkait untuk mendapatkan judulnya
              select: {
                title: true,
              },
            },
          },
        },
        user: { // Ambil detail pengguna yang membuat pesanan
          select: {
            name: true,
            // email: true, // Aktifkan jika ingin mengirim email juga
          },
        },
      },
    });

    if (!orderFromDb) {
      return NextResponse.json({ message: 'Pesanan tidak ditemukan' }, { status: 404 });
    }

    if (orderFromDb.userId !== token.sub) {
        return NextResponse.json({ message: 'Tidak Diizinkan (Forbidden)' }, { status: 403 });
    }

    const responseData: ApiOrderResponse = {
      id: orderFromDb.id,
      createdAt: orderFromDb.createdAt.toISOString(), 
      totalAmount: Number(orderFromDb.totalAmount),  
      shippingAddress: orderFromDb.shippingAddress || 'Alamat tidak tersedia', 
      customerNotes: orderFromDb.customerNotes,
      status: orderFromDb.status,
      items: orderFromDb.items.map(item => ({
        id: item.id,
        productId: item.productId,
        title: item.product.title, 
        quantity: item.quantity,
        priceAtPurchase: Number(item.priceAtPurchase), 
      })),
      user: orderFromDb.user ? { name: orderFromDb.user.name } : undefined,
    };

    return NextResponse.json(responseData, { status: 200 });

  } catch (error) {
    console.error('Gagal mengambil detail pesanan:', error);
    return NextResponse.json({ message: 'Kesalahan Internal Server' }, { status: 500 });
  }
}