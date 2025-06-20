import React from "react";
import Breadcrumb from "../Common/Breadcrumb";
import ShopControls from "./ShopControls";
import prisma from "@/lib/prisma";

// Definisikan tipe untuk searchParams agar lebih jelas
interface ShopPageProps {
  searchParams?: {
    query?: string;
    category?: string;
  };
}

const ShopWithoutSidebar = async ({ searchParams }: ShopPageProps) => {
  const query = searchParams?.query?.toLowerCase() || "";
  const categoryId = searchParams?.category;

  // Bangun klausa 'where' untuk Prisma secara dinamis
  const whereClause: any = {};

  // Tambahkan filter berdasarkan judul jika ada query
  if (query) {
    whereClause.title = {
      contains: query,
      mode: "insensitive",
    };
  }

  // Tambahkan filter berdasarkan kategori jika ada categoryId yang valid
  // Pastikan nama field 'categoryId' sesuai dengan skema Prisma Anda
  if (categoryId && !isNaN(parseInt(categoryId)) && parseInt(categoryId) !== 0) {
    whereClause.categoryId = parseInt(categoryId);
  }

  const products = await prisma.product.findMany({
    where: whereClause, // Gunakan klausa where yang dinamis
    select: {
      id: true,
      title: true,
      price: true,
      discountedPrice: true,
      imagePreviews: true,
      reviews: true,
      stock: true,
    },
  });

  // Fungsi untuk membuat pesan hasil pencarian yang lebih dinamis
  const getResultMessage = () => {
    if (!query && !categoryId) return null;
    
    let message = `Showing <strong>${products.length}</strong> result${products.length !== 1 ? 's' : ''}`;
    const forParts = [];
    if (query) forParts.push(`&quot;${query}&quot;`);
    
    // Anda bisa menambahkan logika untuk menampilkan nama kategori jika perlu
    // const categoryName = await prisma.category.findUnique...
    
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
              <ShopControls products={products} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ShopWithoutSidebar;