// File: src/app/api/admin/users/[userId]/route.ts 

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * GET handler untuk mengambil data satu pengguna berdasarkan ID.
 */
export async function GET(
  req: Request,
  // PERBAIKAN: Gunakan 'context' dengan tipe inline untuk menerima parameter
  context: { params: { userId: string } } 
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    const { userId } = context.params; // Ambil userId dari context.params
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return NextResponse.json({ message: 'Failed to fetch user', error: (error as Error).message }, { status: 500 });
  }
}

/**
 * PUT handler untuk memperbarui detail pengguna.
 */
export async function PUT(
  req: Request,
  // PERBAIKAN: Gunakan 'context' juga di sini
  context: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    const { userId } = context.params; // Ambil userId dari context.params
    const { name, email, role } = await req.json();

    if (!name || !email || !role) {
      return NextResponse.json({ message: 'Name, email, and role are required' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        role,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json({ message: 'Failed to update user', error: (error as Error).message }, { status: 500 });
  }
}