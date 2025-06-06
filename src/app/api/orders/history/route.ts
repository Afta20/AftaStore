// File: src/app/api/orders/history/route.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';

/**
 * GET Handler: Fetches the order history for the currently authenticated user.
 * This endpoint is protected and ensures a user can only see their own orders.
 */
export async function GET(request: NextRequest) {
  // Get the user's session token to identify them
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  // If there's no token or user ID (sub), the user is not authenticated
  if (!token || !token.sub) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  const userId = token.sub;

  try {
    const orders = await prisma.order.findMany({
      where: {
        // This is the crucial part: filter orders by the logged-in user's ID
        userId: userId,
      },
      orderBy: {
        createdAt: 'desc', // Show the most recent orders first
      },
      select: { // Select only the necessary fields for the history list
        id: true,
        createdAt: true,
        status: true,
        totalAmount: true,
        items: { // Also, count the number of items in each order
          select: {
            quantity: true,
          }
        }
      },
    });

    if (!orders) {
      return NextResponse.json([], { status: 200 }); // Return empty array if no orders found
    }

    // Format the data to be more frontend-friendly
    const formattedOrders = orders.map(order => ({
      id: order.id,
      createdAt: order.createdAt,
      status: order.status,
      totalAmount: Number(order.totalAmount),
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    }));

    return NextResponse.json(formattedOrders, { status: 200 });

  } catch (error) {
    console.error("Failed to fetch user order history:", error);
    return NextResponse.json({ message: 'Failed to retrieve order history', error: (error as Error).message }, { status: 500 });
  }
}
