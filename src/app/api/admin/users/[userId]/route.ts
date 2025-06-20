// File: src/app/api/admin/users/[userId]/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// Skema validasi untuk data yang masuk saat update (PUT)
const userUpdateSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters long.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  role: z.enum(['ADMIN', 'USER', 'EDITOR'], { message: "Role must be one of: 'ADMIN', 'USER', 'EDITOR'." }),
});


/**
 * GET: Mengambil detail satu pengguna berdasarkan ID.
 */
export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  // Keamanan: Hanya admin yang bisa melihat detail pengguna
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Jangan kirim password hash ke frontend
    const { password, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);

  } catch (error) {
    console.error(`[GET_USER_ERROR]`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}


/**
 * PUT: Memperbarui data seorang pengguna berdasarkan ID.
 */
export async function PUT(
  req: Request,
  { params }: { params: { userId: string } }
) {
  // Keamanan: Hanya admin yang bisa mengedit pengguna
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, email, role } = userUpdateSchema.parse(body); // Validasi input

    const updatedUser = await prisma.user.update({
      where: { id: params.userId },
      data: {
        name,
        email,
        role,
      },
    });
    
    // Jangan kirim password hash ke frontend
    const { password, ...userWithoutPassword } = updatedUser;
    return NextResponse.json(userWithoutPassword, { status: 200 });

  } catch (error) {
    // Tangani error validasi dari Zod
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
    }
    
    // Tangani error umum lainnya
    console.error(`[PUT_USER_ERROR]`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}


/**
 * DELETE: Menghapus seorang pengguna berdasarkan ID.
 * (Fungsi dari langkah sebelumnya, disertakan untuk kelengkapan)
 */
export async function DELETE(
  req: Request,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  if (session.user.id === params.userId) {
    return NextResponse.json({ message: 'Admin cannot delete their own account.' }, { status: 400 });
  }

  try {
    await prisma.user.delete({
      where: { id: params.userId },
    });
    return NextResponse.json({ message: 'User deleted successfully.' }, { status: 200 });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Error: User not found.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}