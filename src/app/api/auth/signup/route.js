// File: src/app/api/auth/signup/route.js

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Impor Prisma client
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Semua kolom wajib diisi' },
        { status: 400 }
      );
    }

    // Cek apakah pengguna sudah ada menggunakan Prisma
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email sudah terdaftar' },
        { status: 409 } // 409 Conflict
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10); // 10 adalah salt rounds

    // Simpan pengguna baru ke database menggunakan Prisma
    // Sesuaikan field 'name' dengan 'fullname' dari kodemu, dan 'email' untuk username
    // Pastikan model User di schema.prisma memiliki field: name, email, hashedPassword, role
    const newUser = await prisma.user.create({
      data: {
        name: name,       // Menggunakan 'name' dari input untuk field 'name' di Prisma (sesuai fullname di kodemu)
        email: email,
        hashedPassword: hashedPassword,
        role: 'user',     // Mengatur role default
        // Jika kamu memiliki field 'username' terpisah di model User Prisma dan ingin mengisinya dengan email:
        // username: email,
      },
    });

    // Data pengguna yang akan dikembalikan (hindari mengirim password)
    const userToReturn = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    };

    return NextResponse.json(
      { message: 'Pengguna berhasil terdaftar', user: userToReturn },
      { status: 201 }
    );

  } catch (error) {
    console.error('Kesalahan Pendaftaran:', error);
    // Penanganan error spesifik dari Prisma, misalnya jika ada unique constraint lain yang gagal
    if (error.code === 'P2002') { // Kode error Prisma untuk unique constraint violation
        // Cek field mana yang menyebabkan error (jika bukan email, yang sudah dicek)
        const target = error.meta && error.meta.target ? error.meta.target.join(', ') : 'field';
        return NextResponse.json({ message: `Data ${target} sudah digunakan.` }, { status: 409 });
    }
    return NextResponse.json(
      { message: 'Terjadi kesalahan pada server saat pendaftaran' },
      { status: 500 }
    );
  }
}