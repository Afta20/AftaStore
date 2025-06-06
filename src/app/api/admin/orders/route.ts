// File: src/app/api/admin/orders/route.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma'; 
import { getToken } from 'next-auth/jwt';

// Handler GET untuk mengambil semua pesanan
export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: 'desc', 
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        items: {
          select: {
            quantity: true,
          }
        }
      },
    });

    // Konversi tipe data Decimal ke number sebelum dikirim ke frontend
    const formattedOrders = orders.map(order => ({
    ...order,
    totalAmount: Number(order.totalAmount),
    totalItems: order.items.reduce((sum, item) => sum + item.quantity, 0),
    }));

    return NextResponse.json(formattedOrders, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json({ message: 'Failed to fetch orders', error: (error as Error).message }, { status: 500 });
  }
}
