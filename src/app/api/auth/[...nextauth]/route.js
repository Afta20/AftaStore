// File: src/app/api/auth/[...nextauth]/route.js

import NextAuth from "next-auth";
// Impor authOptions dari file terpisah (misalnya src/lib/auth.js)
import { authOptions } from "@/lib/auth"; // <-- authOptions HANYA diimpor dari sini

// Impor lain yang mungkin masih relevan untuk pemanggilan NextAuth jika diperlukan,
// tapi biasanya tidak jika semua sudah di authOptions.
// import { PrismaAdapter } from "@next-auth/prisma-adapter"; // Tidak perlu di sini jika sudah di lib/auth.js
// import prisma from "@/lib/prisma"; // Tidak perlu di sini jika sudah di lib/auth.js
// import CredentialsProvider from "next-auth/providers/credentials"; // Tidak perlu di sini jika sudah di lib/auth.js
// import bcrypt from 'bcryptjs'; // Tidak perlu di sini jika sudah di lib/auth.js

// console.log("Tipe dari NextAuth:", typeof NextAuth); // Bisa dihapus
// console.log("Isi NextAuth:", NextAuth);          // Bisa dihapus

// ---- BLOK authOptions YANG PANJANG DIHAPUS DARI SINI ----
// export const authOptions = { ... }; <--- HAPUS SEMUA BAGIAN INI SAMPAI PENUTUPNYA

// Pemanggilan NextAuth menggunakan authOptions yang diimpor
const handler = NextAuth && NextAuth.default ? NextAuth.default(authOptions) : NextAuth(authOptions);

export { handler as GET, handler as POST };