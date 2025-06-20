// Lokasi: src/lib/auth.ts (atau di mana pun Anda mendefinisikan authOptions)

import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "./prisma"; // Sesuaikan path ke prisma client Anda
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

// Modul Augmentation untuk menambahkan 'id' dan 'role' ke tipe bawaan NextAuth
declare module "next-auth" {
  interface User {
    id: string;
    role: string;
  }
  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt", // Gunakan JWT untuk session strategy
  },
  providers: [
    // --- SESUAIKAN PROVIDER ANDA DI SINI ---
    // Ini adalah contoh jika Anda menggunakan login email & password (Credentials)
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        // Kembalikan objek user dengan id dan role
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role, // Pastikan role disertakan
        };
      },
    }),
    // Tambahkan provider lain seperti Google, GitHub di sini jika ada
  ],

  // === BAGIAN PALING PENTING ADA DI SINI ===
  callbacks: {
    // 1. Callback 'jwt' dipanggil saat token dibuat
    async jwt({ token, user }) {
      // Saat pertama kali login ('user' object tersedia), tambahkan id dan role ke token
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      // Token ini akan diteruskan ke callback 'session'
      return token;
    },

    // 2. Callback 'session' dipanggil saat sesi diakses
    async session({ session, token }) {
      // Ambil id dan role dari token (yang sudah kita isi di callback 'jwt')
      // dan masukkan ke dalam objek session.user
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      // Objek session ini yang akan bisa Anda akses di client dan server
      return session;
    },
  },

  pages: {
    signIn: '/signin', // Arahkan ke halaman login kustom Anda
  },
  secret: process.env.NEXTAUTH_SECRET, // Pastikan NEXTAUTH_SECRET ada di .env
};