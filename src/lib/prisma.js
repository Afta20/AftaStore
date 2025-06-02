// File: src/lib/prisma.js

import { PrismaClient } from '@prisma/client';

let prisma;

if (process.env.NODE_ENV === 'production') {
  // Di lingkungan produksi, buat instance baru
  prisma = new PrismaClient();
} else {
  // Di lingkungan pengembangan, gunakan instance global untuk menghindari
  // terlalu banyak koneksi database karena hot-reloading Next.js
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export default prisma;