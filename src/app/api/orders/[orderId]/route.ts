import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

// Perhatikan: Tidak ada 'interface RouteContext' lagi di sini.

export async function GET(
  req: NextRequest,
  // --- INI PERUBAHAN UTAMANYA ---
  // Tipe untuk 'context' didefinisikan secara langsung (inline) di sini.
  context: { params: { orderId: string } }
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || !token.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Cara kita mengambil orderId tetap sama
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