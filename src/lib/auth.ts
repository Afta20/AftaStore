// File: src/lib/auth.ts (Versi Final yang Benar)

import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "./prisma"; // Sesuaikan path ke prisma client Anda
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from 'bcryptjs';

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
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        // Memeriksa 'hashedPassword' sesuai kode asli Anda
        if (!user || !user.hashedPassword) {
          return null;
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isValidPassword) {
          return null;
        }

        // Kembalikan objek user dengan id dan role
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role || 'USER', // Beri default 'USER' jika role null
          image: user.image,
        };
      },
    }),
    // Tambahkan provider lain di sini jika ada
  ],

  // === BAGIAN PALING PENTING ADA DI SINI ===
  callbacks: {
    // Callback 'jwt' dipanggil saat token dibuat
    async jwt({ token, user }) {
      // Saat pertama kali login ('user' object tersedia), tambahkan id dan role ke token
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },

    // Callback 'session' dipanggil saat sesi diakses
    async session({ session, token }) {
      // Ambil id dan role dari token dan masukkan ke dalam objek session.user
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },

  pages: {
    signIn: '/signin',
    error: '/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
};