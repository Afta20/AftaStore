// File: src/app/api/admin/dashboard/summary/route.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma'; // Sesuaikan path ke Prisma client Anda
import { getToken } from 'next-auth/jwt';

export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token || token.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Total Pengguna
    const totalUsers = await prisma.user.count({
        // Anda bisa menambahkan filter jika ada peran 'customer' atau sejenisnya
        // where: { role: 'customer' } 
    });

    // 2. Total Pesanan (semua waktu)
    const totalOrders = await prisma.order.count();

    // 3. Pendapatan Bulan Ini
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999); // Akhir hari

    const monthlyRevenueData = await prisma.order.aggregate({
      _sum: {
        totalAmount: true,
      },
      where: {
        createdAt: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
        // Anda mungkin ingin filter status pesanan yang sudah 'PAID' atau 'DELIVERED'
        // status: { in: ['PAID', 'DELIVERED', 'COMPLETED'] } 
      },
    });
    const monthlyRevenue = monthlyRevenueData._sum.totalAmount || 0;

    // 4. Produk Terjual Bulan Ini (jumlah item dari pesanan)
    const productsSoldThisMonthData = await prisma.orderItem.aggregate({
        _sum: {
            quantity: true,
        },
        where: {
            order: {
                createdAt: {
                    gte: firstDayOfMonth,
                    lte: lastDayOfMonth,
                },
                // status: { in: ['PAID', 'DELIVERED', 'COMPLETED'] } 
            }
        }
    });
    const productsSoldThisMonth = productsSoldThisMonthData._sum.quantity || 0;

    const summary = {
      totalUsers,
      totalOrders,
      monthlyRevenue: Number(monthlyRevenue), // Konversi Decimal ke number
      productsSoldThisMonth,
    };

    return NextResponse.json(summary, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch dashboard summary:", error);
    return NextResponse.json({ message: 'Failed to fetch dashboard summary' }, { status: 500 });
  }
}
