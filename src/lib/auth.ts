// File: src/lib/auth.ts (Versi Final Gabungan yang Benar)

import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { type AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from 'bcryptjs'; // Menggunakan bcryptjs sesuai kode asli Anda

// Module Augmentation untuk menambahkan 'id' dan 'role' ke tipe bawaan NextAuth
// Ini adalah praktik terbaik agar TypeScript tidak error
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

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      // Menggunakan kembali fungsi authorize Anda yang sudah benar
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        
        const user = await prisma.user.findUnique({ 
          where: { email: credentials.email } 
        });

        // Memeriksa 'hashedPassword' sesuai kode asli Anda
        if (!user || !user.hashedPassword) return null;

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isValidPassword) return null;

        // Mengembalikan semua properti yang dibutuhkan, termasuk id dan role
        return { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          image: user.image, 
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    // Callback ini memastikan id dan role masuk ke dalam token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    // Callback ini memastikan id dan role dari token masuk ke dalam objek session
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};