// File: src/app/api/admin/orders/[orderId]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';

/**
 * GET Handler: Mengambil detail satu pesanan spesifik.
 * Endpoint ini akan mengembalikan data pesanan lengkap termasuk item produk
 * dan informasi pelanggan.
 */
export async function GET(
  request: NextRequest,
  context: { params?: { orderId?: string | string[] } } // <-- Perbaikan Signature
) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const orderId = context.params?.orderId;

  // Validasi bahwa orderId adalah string tunggal
  if (typeof orderId !== 'string') {
    return NextResponse.json({ message: 'Order ID tidak valid' }, { status: 400 });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { // Ambil detail pelanggan
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
        items: { // Ambil semua item dalam pesanan ini
          include: {
            product: { // Untuk setiap item, ambil detail produknya
              select: {
                title: true,
                imagePreviews: true, // Untuk menampilkan gambar produk
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    // Konversi tipe data Decimal ke number agar aman di frontend
    const formattedOrder = {
      ...order,
      totalAmount: Number(order.totalAmount),
      items: order.items.map(item => ({
        ...item,
        priceAtPurchase: Number(item.priceAtPurchase),
      })),
    };

    return NextResponse.json(formattedOrder, { status: 200 });

  } catch (error) {
    console.error(`Failed to fetch order ${orderId}:`, error);
    return NextResponse.json({ message: 'Failed to fetch order details', error: (error as Error).message }, { status: 500 });
  }
}

/**
 * PUT Handler: Memperbarui status pesanan.
 * Admin bisa mengubah status pesanan (misalnya dari PENDING ke SHIPPED).
 */
export async function PUT(
  request: NextRequest,
  context: { params?: { orderId?: string | string[] } } // <-- Perbaikan Signature
) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== 'admin') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const orderId = context.params?.orderId;
    
    // Validasi bahwa orderId adalah string tunggal
    if (typeof orderId !== 'string') {
        return NextResponse.json({ message: 'Order ID tidak valid' }, { status: 400 });
    }

    try {
        const { status } = await request.json();

        // Validasi input status
        if (!status || typeof status !== 'string') {
            return NextResponse.json({ message: 'Invalid status provided' }, { status: 400 });
        }
        
        // Daftar status yang diizinkan (opsional, tapi praktik yang baik)
        const allowedStatuses = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED'];
        if (!allowedStatuses.includes(status.toUpperCase())) {
            return NextResponse.json({ message: `Status "${status}" is not valid.` }, { status: 400 });
        }

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                status: status.toUpperCase(),
            },
        });

        return NextResponse.json(updatedOrder, { status: 200 });

    } catch (error: any) {
        console.error(`Failed to update order status for ${orderId}:`, error);
        if (error.code === 'P2025') { // Error jika orderId tidak ditemukan
             return NextResponse.json({ message: 'Order not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Failed to update order status', error: error.message }, { status: 500 });
    }
}
