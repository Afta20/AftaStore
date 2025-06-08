import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

// Definisikan tipe untuk argumen kedua secara eksplisit
interface RouteContext {
  params: {
    orderId: string;
  };
}

export async function GET(req: NextRequest, context: RouteContext) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || !token.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Ambil orderId dari context.params, bukan langsung dari argumen
  const { orderId } = context.params;

  if (!orderId) {
    return NextResponse.json({ message: 'Order ID tidak ditemukan.' }, { status: 400 });
  }

  try {
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        userId: token.id as string,
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json({ message: 'Pesanan tidak ditemukan atau Anda tidak memiliki akses.' }, { status: 404 });
    }

    return NextResponse.json(order, { status: 200 });

  } catch (error: any) {
    console.error(`Gagal mengambil pesanan ${orderId}:`, error);
    return NextResponse.json({ message: 'Terjadi kesalahan internal.', error: error.message }, { status: 500 });
  }
}