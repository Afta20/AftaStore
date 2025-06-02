// File: src/app/api/auth/[...nextauth]/route.js

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma"; // Impor instance prisma kita
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from 'bcryptjs'; // Kamu sudah menggunakan ini

console.log("Tipe dari NextAuth:", typeof NextAuth);
console.log("Isi NextAuth:", NextAuth);

// Definisikan authOptions agar bisa diekspor jika dibutuhkan di tempat lain (opsional)
export const authOptions = {
  // Gunakan PrismaAdapter dan berikan instance prisma kita
  adapter: PrismaAdapter(prisma),

  providers: [
    CredentialsProvider.default({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" }, // Tipe bisa text atau email
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        // Cari user di database menggunakan Prisma
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user) {
          // User tidak ditemukan
          return null;
        }

        // Pastikan user memiliki hashedPassword (sesuai nama field di schema.prisma)
        if (!user.hashedPassword) {
            // Jika user login via OAuth dan belum set password, atau data korup
            return null;
        }

        // Validasi password dengan bcrypt (field di db: user.hashedPassword)
        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.hashedPassword // Pastikan ini 'hashedPassword' sesuai dengan schema.prisma
        );

        if (!isValidPassword) {
          // Password salah
          return null;
        }

        // Login berhasil, kembalikan user
        // Pastikan field yang dikembalikan ada di model User Prisma & dibutuhkan token/session
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image, // Ambil juga image jika ada dan ingin digunakan
          role: user.role,   // Ambil role dari user
        };
      },
    }),
    // Tambahkan provider lain di sini jika ada (misalnya Google, GitHub, dll.)
  ],

  callbacks: {
    async jwt({ token, user }) {
      // 'user' object hanya ada saat pertama kali sign in / sign up
      if (user) {
        token.id = user.id;
        token.role = user.role; // Teruskan role ke token
        // kamu juga bisa meneruskan properti lain dari 'user' object di sini
        // token.name = user.name; // jika dibutuhkan
        // token.image = user.image; // jika dibutuhkan
      }
      return token;
    },
    async session({ session, token }) {
      // 'token' object berisi data dari callback jwt
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role; // Teruskan role ke session
        // session.user.name = token.name; // jika kamu menambahkannya di callback jwt
        // session.user.image = token.image; // jika kamu menambahkannya di callback jwt
      }
      return session;
    },
  },

  pages: {
    signIn: "/signin", // Halaman signin-mu
    error: "/signin",  // Halaman error (bisa sama atau beda)
  },

  session: {
    strategy: "jwt", // Direkomendasikan
  },

  secret: process.env.NEXTAUTH_SECRET,

  // debug: process.env.NODE_ENV === 'development', // Uncomment untuk debugging saat development
};

const handler = NextAuth && NextAuth.default ? NextAuth.default(authOptions) : NextAuth(authOptions);

export { handler as GET, handler as POST };