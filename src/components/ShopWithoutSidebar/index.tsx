"use client";
import React, { useState, useEffect } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import { useSearchParams } from "next/navigation";
import SingleGridItem from "../Shop/SingleGridItem";
import SingleListItem from "../Shop/SingleListItem";
import CustomSelect from "../ShopWithSidebar/CustomSelect";
import { Product } from "@/types/product"; // Impor tipe Product terpusat

const ShopWithoutSidebar = () => {
  const [productStyle, setProductStyle] = useState("grid");
  const [products, setProducts] = useState<Product[]>([]); // State untuk menyimpan produk dari API
  const [loading, setLoading] = useState(true); // State untuk status loading
  const [error, setError] = useState<string | null>(null); // State untuk pesan error

  const searchParams = useSearchParams();
  const query = searchParams.get("query")?.toLowerCase() || "";
  
  // --- BARU: Mengambil data dari API saat komponen dimuat ---
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Pastikan Anda sudah punya API di /api/products
        const response = await fetch('/api/products'); 
        if (!response.ok) {
          throw new Error('Gagal mengambil data produk dari server.');
        }
        const data: Product[] = await response.json();
        setProducts(data);
      } catch (err: any) {
        setError(err.message);
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []); // Array dependensi kosong agar hanya berjalan sekali

  // Filter data yang sudah di-fetch berdasarkan query pencarian
  const filteredData = products.filter((item) =>
    item.title.toLowerCase().includes(query)
  );

  const options = [
    { label: "Latest Products", value: "0" },
    { label: "Best Selling", value: "1" },
    { label: "Old Products", value: "2" },
  ];

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
              {query && !loading && (
                <p className="text-sm text-gray-600 mb-4">
                  Showing <strong>{filteredData.length}</strong> result{filteredData.length !== 1 && "s"} for &quot;<strong>{query}</strong>&quot;
                </p>
              )}
              <div className="rounded-lg bg-white shadow-1 pl-3 pr-2.5 py-2.5 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-4">
                    <CustomSelect options={options} />
                    <p>
                      Showing <span className="text-dark">{filteredData.length} of {products.length}</span> Products
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setProductStyle("grid")}
                      aria-label="button for product grid tab"
                      className={`${
                        productStyle === "grid"
                          ? "bg-blue border-blue text-white"
                          : "text-dark bg-gray-1 border-gray-3"
                      } flex items-center justify-center w-10.5 h-9 rounded-[5px] border ease-out duration-200 hover:bg-blue hover:border-blue hover:text-white`}
                    >
                      {/* Grid Icon SVG */}
                    </button>
                    <button
                      onClick={() => setProductStyle("list")}
                      aria-label="button for product list tab"
                      className={`${
                        productStyle === "list"
                          ? "bg-blue border-blue text-white"
                          : "text-dark bg-gray-1 border-gray-3"
                      } flex items-center justify-center w-10.5 h-9 rounded-[5px] border ease-out duration-200 hover:bg-blue hover:border-blue hover:text-white`}
                    >
                      {/* List Icon SVG */}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Tampilkan pesan loading atau error jika ada */}
              {loading && <p className="text-center py-10">Loading products...</p>}
              {error && <p className="text-center py-10 text-red-500">Error: {error}</p>}
              
              {/* Render produk setelah selesai loading dan tidak ada error */}
              {!loading && !error && (
                <div
                  className={`${
                    productStyle === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-7.5 gap-y-9"
                      : "flex flex-col gap-7.5"
                  }`}
                >
                  {filteredData.length > 0 ? (
                    filteredData.map((item, key) =>
                      productStyle === "grid" ? (
                        <SingleGridItem item={item} key={key} />
                      ) : (
                        <SingleListItem item={item} key={key} />
                      )
                    )
                  ) : (
                    <p className="text-center w-full py-10">No products found {query && `for "${query}"`}.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ShopWithoutSidebar;
