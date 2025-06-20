import React from "react";
import Breadcrumb from "@/components/Common/Breadcrumb"; 
import ShopControls from "@/components/ShopWithoutSidebar/ShopControls";      
import prisma from "@/lib/prisma";
import { Metadata } from "next";
import { Product } from "@/types/product";

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

// Semua logika sekarang ada di dalam satu komponen async ini
const ShopWithoutSidebarPage = async ({ searchParams }: PageProps) => {
  const query = searchParams?.query?.toLowerCase() || "";
  const categoryId = searchParams?.category;

  const whereClause: any = {};

  // Pastikan 'title' adalah nama field yang benar di schema.prisma Anda
  if (query) {
    whereClause.title = {
      contains: query,
      mode: "insensitive",
    };
  }

  // Pastikan 'categoryId' adalah nama field yang benar di schema.prisma
  if (categoryId && !isNaN(parseInt(categoryId)) && parseInt(categoryId) !== 0) {
    whereClause.categoryId = parseInt(categoryId);
  }

  const productsFromDB = await prisma.product.findMany({
    where: whereClause,
    select: {
      id: true,
      title: true, // atau 'name' jika itu yang benar
      price: true,
      discountedPrice: true,
      imagePreviews: true,
      reviews: true,
      stock: true,
    },
  });

  // Solusi untuk error 'Decimal objects are not supported'
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
              {/* ShopControls tetap dipanggil, karena ia adalah komponen Client */}
              <ShopControls products={serializableProducts as Product[]} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ShopWithoutSidebarPage;