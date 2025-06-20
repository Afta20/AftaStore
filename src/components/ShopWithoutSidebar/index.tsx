import React from "react";
import Breadcrumb from "../Common/Breadcrumb";
import ShopControls from "./ShopControls";
import prisma from "@/lib/prisma";
import { Product } from "@/types/product";


interface ComponentProps {
  query?: string;
  category?: string;
}

const ShopWithoutSidebarComponent = async ({ query, category }: ComponentProps) => {
  // 3. Gunakan prop 'query' dan 'category' yang sudah jadi string
  const lowerCaseQuery = query?.toLowerCase() || "";
  const categoryId = category;

  const whereClause: any = {};

  if (lowerCaseQuery) {
    whereClause.title = { // Ingat, cek nama field ini vs schema.prisma
      contains: lowerCaseQuery,
      mode: "insensitive",
    };
  }

  if (categoryId && !isNaN(parseInt(categoryId)) && parseInt(categoryId) !== 0) {
    whereClause.categoryId = parseInt(categoryId); // Cek juga nama field ini
  }

  const productsFromDB = await prisma.product.findMany({
    where: whereClause,
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