import React from "react";
import Breadcrumb from "../Common/Breadcrumb";
import ShopControls from "./ShopControls"; // Impor komponen klien baru
import prisma from "@/lib/prisma"; // Impor prisma client

// Ubah komponen menjadi async untuk bisa menggunakan await
const ShopWithoutSidebar = async ({
  searchParams,
}: {
  searchParams?: { query?: string };
}) => {
  const query = searchParams?.query?.toLowerCase() || "";

  // Mengambil data produk langsung dari database Prisma
  const products = await prisma.product.findMany({
    where: {
      // Filter produk berdasarkan query pencarian
      title: {
        startsWith: query,
        mode: "insensitive", // tidak peduli huruf besar/kecil
      },
    },
    // Pastikan semua data yang dibutuhkan termasuk 'stock' diambil
    select: {
      id: true,
      title: true,
      price: true,
      discountedPrice: true,
      imagePreviews: true,
      reviews: true,
      stock: true, // DATA STOK DIAMBIL DARI DATABASE
    },
  });

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
              {query && (
                <p className="text-sm text-gray-600 mb-4">
                  Showing <strong>{products.length}</strong> result
                  {products.length !== 1 && "s"} for &quot;
                  <strong>{query}</strong>&quot;
                </p>
              )}
              {/* Komponen ShopControls akan menangani interaktivitas dan menerima data produk */}
              <ShopControls products={products} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ShopWithoutSidebar;