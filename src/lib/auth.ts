import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from 'bcryptjs';
import { type AuthOptions } from "next-auth";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // PERBAIKAN #1: Hapus .default
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        
        const user = await prisma.user.findUnique({ 
          where: { email: credentials.email } 
        });

        if (!user || !user.hashedPassword) return null;

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isValidPassword) return null;

        // Pastikan semua properti yang dibutuhkan oleh tipe User dan JWT ada di sini
        return { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          image: user.image, 
          role: user.role, // Tipe User kita sudah punya 'role'
        };
      },
    }),
    // Tambahkan provider lain di sini jika ada
  ],
  callbacks: {
    // PERBAIKAN #2: TypeScript sekarang akan mengenali 'user.role' karena file next-auth.d.ts
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    // PERBAIKAN #3: TypeScript sekarang akan mengenali 'session.user.id' dan 'session.user.role'
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
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