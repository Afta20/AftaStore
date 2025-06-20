// File: src/app/api/admin/users/[userId]/route.ts (Workaround Final untuk Build Error)

import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// Skema validasi untuk data update pengguna menggunakan Zod
const userUpdateSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long.'),
  email: z.string().email('Invalid email address.'),
  role: z.enum(['ADMIN', 'USER', 'EDITOR']),
});

// Helper function untuk mengambil userId dari request
const getUserIdFromRequest = (req: NextRequest): string | null => {
    const segments = req.nextUrl.pathname.split('/');
    // Mengambil segmen terakhir, yang seharusnya adalah ID
    return segments.pop() || null;
}

/**
 * GET: Mengambil detail satu pengguna berdasarkan ID.
 * Menggunakan workaround dengan req.nextUrl untuk menghindari bug 'context'.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ message: 'User ID not found in URL' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);

  } catch (error) {
    console.error("[GET_USER_ERROR]", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PUT: Memperbarui data seorang pengguna berdasarkan ID.
 * Menggunakan workaround dengan req.nextUrl.
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ message: 'User ID not found in URL' }, { status: 400 });
    }

    const body = await req.json();
    const { name, email, role } = userUpdateSchema.parse(body);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name, email, role },
    });
    
    const { password, ...userWithoutPassword } = updatedUser;
    return NextResponse.json(userWithoutPassword, { status: 200 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
    }
    console.error("[PUT_USER_ERROR]", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * DELETE: Menghapus seorang pengguna berdasarkan ID.
 * Menggunakan workaround dengan req.nextUrl.
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ message: 'User ID not found in URL' }, { status: 400 });
    }

    if (session.user.id === userId) {
      return NextResponse.json({ message: 'Admin cannot delete their own account.' }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id: userId },
    });
    
    return NextResponse.json({ message: 'User deleted successfully.' }, { status: 200 });

  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Error: User not found.' }, { status: 404 });
    }
    console.error("[DELETE_USER_ERROR]", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}