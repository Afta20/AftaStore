// File: src/app/shop-without-sidebar/page.tsx

import React from "react";
import Breadcrumb from "@/components/Common/Breadcrumb";
import ShopControls from "@/components/ShopWithoutSidebar/ShopControls";
import prisma from "@/lib/prisma";
import { Metadata } from "next";
import { Product } from "@/types/product";

// === PERBAIKAN 1: MEMAKSA HALAMAN MENJADI DINAMIS ===
// Baris ini memberitahu Next.js untuk tidak menyimpan cache halaman ini
// dan selalu mengambil data baru dari server setiap kali diakses.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Aftastore | Shop Without Sidebar Page",
};

// Definisikan tipe untuk props
interface PageProps {
  searchParams?: {
    query?: string;
    category?: string;
  };
}

const ShopWithoutSidebarPage = async ({ searchParams }: PageProps) => {
  const query = searchParams?.query?.toLowerCase() || "";
  const categoryId = searchParams?.category;

  // === PERBAIKAN 2: TAMBAHKAN FILTER STATUS DI SINI ===
  const whereClause: any = {
    status: 'ACTIVE', // Hanya cari produk yang statusnya AKTIF
  };

  if (query) {
    whereClause.title = {
      contains: query,
      mode: "insensitive",
    };
  }

  if (categoryId && !isNaN(parseInt(categoryId)) && parseInt(categoryId) !== 0) {
    whereClause.categoryId = parseInt(categoryId);
  }

  const productsFromDB = await prisma.product.findMany({
    where: whereClause, // Gunakan klausa where yang sudah lengkap
    // Pastikan select menyertakan semua data yang dibutuhkan oleh ShopControls
    select: {
      id: true,
      title: true,
      price: true,
      discountedPrice: true,
      imagePreviews: true,
      reviews: true,
      stock: true,
      status: true,
      category: {
        select: {
            name: true,
        }
      }
    },
  });

  // Konversi tipe Decimal
  const serializableProducts = productsFromDB.map(product => ({
    ...product,
    price: product.price.toNumber(),
    discountedPrice: product.discountedPrice ? product.discountedPrice.toNumber() : null,
  }));

  const getResultMessage = () => {
    if (!query && !categoryId) return null;
    let message = `Showing <strong>${serializableProducts.length}</strong> result${serializableProducts.length !== 1 ? 's' : ''}`;
    const forParts = [];
    if (query) forParts.push(`&quot;${query}&quot;`);
    if (forParts.length > 0) {
      message += ` for ${forParts.join(' ')}`;
    }
    return <p className="text-sm text-gray-600 mb-4" dangerouslySetInnerHTML={{ __html: message }} />;
  };

  return (
    <main>
      <Breadcrumb
        title={"Explore All Products"}
        pages={["shop", "/", "shop without sidebar"]}
      />
      <section className="overflow-hidden relative pb-20 pt-5 lg:pt-20 xl:pt-28 bg-[#f3f4f6]">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex gap-7.5">
            <div className="w-full">
              {getResultMessage()}
              <ShopControls products={serializableProducts as Product[]} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ShopWithoutSidebarPage;
