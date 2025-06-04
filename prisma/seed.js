// File: prisma/seed.js

import { PrismaClient } from '@prisma/client';
import shopData from '../src/components/Shop/shopData.js'; // <--- SESUAIKAN INI

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);


  const category1 = await prisma.category.upsert({
    where: { name: 'Elektronik' },
    update: {},
    create: {
      name: 'Elektronik',
    },
  });

  const category2 = await prisma.category.upsert({
    where: { name: 'Aksesoris Komputer' },
    update: {},
    create: {
      name: 'Aksesoris Komputer',
    },
  });

  console.log(`Created categories: ${category1.name}, ${category2.name}`);

  // 2. Siapkan data produk untuk dimasukkan, sesuaikan dengan skema Prisma
  const productsToCreate = shopData.map((product) => {
    // Tentukan kategori secara manual untuk contoh ini
    // Kamu bisa membuat logika yang lebih kompleks untuk menentukan kategori
    let categoryIdToAssign;
    if (product.title.toLowerCase().includes('gamepad') || product.title.toLowerCase().includes('mouse')) {
      categoryIdToAssign = category2.id; // Aksesoris Komputer
    } else {
      categoryIdToAssign = category1.id; // Elektronik (default untuk contoh ini)
    }

    return {
      title: product.title,
      // Ambil array 'previews' dari 'imgs' dan simpan sebagai 'imagePreviews'
      imagePreviews: product.imgs && product.imgs.previews ? product.imgs.previews : [],
      reviews: product.reviews,
      // Harga harus dalam format Decimal, Prisma akan menanganinya jika kita berikan angka
      price: product.price,
      discountedPrice: product.discountedPrice,
      // Hubungkan dengan kategori yang sudah dibuat
      categoryId: categoryIdToAssign,
      // ID akan dibuat otomatis oleh Prisma, jadi kita tidak perlu menyertakan product.id dari shopData
      // createdAt dan updatedAt juga akan dibuat otomatis
    };
  });



  // Alternatif: Loop untuk create satu per satu (lebih aman untuk relasi & default)
  for (const productData of productsToCreate) {
    await prisma.product.create({
      data: productData,
    });
  }

  console.log(`Seeding finished. ${productsToCreate.length} products created.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });