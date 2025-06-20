// File: src/components/ShopWithoutSidebar/index.tsx (atau di mana pun komponen ini berada)

import React from "react";
import Breadcrumb from "../Common/Breadcrumb"; // Sesuaikan path jika perlu
import ShopControls from "./ShopControls";    // Sesuaikan path jika perlu
import prisma from "@/lib/prisma";
import { Product } from "@/types/product";

// Definisikan tipe untuk props yang diterima
interface ComponentProps {
  query?: string;
  category?: string;
}

const ShopWithoutSidebarComponent = async ({ query, category }: ComponentProps) => {
  const lowerCaseQuery = query?.toLowerCase() || "";
  const categoryId = category;

  // === PERBAIKAN UTAMA DI SINI ===
  const whereClause: any = {
    // Tambahkan kondisi WAJIB: produk harus berstatus ACTIVE
    status: 'ACTIVE',
  };

  // Tambahkan filter lain jika ada
  if (lowerCaseQuery) {
    whereClause.title = {
      contains: lowerCaseQuery,
      mode: "insensitive",
    };
  }

  if (categoryId && !isNaN(parseInt(categoryId)) && parseInt(categoryId) !== 0) {
    whereClause.categoryId = parseInt(categoryId);
  }
  // === AKHIR PERBAIKAN ===


  const productsFromDB = await prisma.product.findMany({
    where: whereClause, // Gunakan klausa where yang sudah diperbaiki
    select: {
      id: true,
      title: true,
      price: true,
      discountedPrice: true,
      imagePreviews: true,
      reviews: true,
      stock: true,
      status: true, // Sertakan status untuk debugging jika perlu
      category: { // Sertakan nama kategori
        select: {
            name: true,
        }
      }
    },
  });

  // Ubah produk menjadi objek 'polos' sebelum dikirim ke Client Component.
  const serializableProducts = productsFromDB.map(product => ({
    ...product,
    price: product.price.toNumber(),
    discountedPrice: product.discountedPrice ? product.discountedPrice.toNumber() : null,
  }));

  const getResultMessage = () => {
    if (!query && !category) return null;
    let message = `Showing <strong>${serializableProducts.length}</strong> result${serializableProducts.length !== 1 ? 's' : ''}`;
    const forParts = [];
    if (query) forParts.push(`&quot;${query}&quot;`);
    if (forParts.length > 0) {
      message += ` for ${forParts.join(' ')}`;
    }
    return <p className="text-sm text-gray-600 mb-4" dangerouslySetInnerHTML={{ __html: message }} />;
  };

  return (
    <>
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
    </>
  );
};

export default ShopWithoutSidebarComponent;
