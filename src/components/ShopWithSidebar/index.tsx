"use client";
import React, { useState, useEffect } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import CustomSelect from "./CustomSelect";
import CategoryDropdown from "./CategoryDropdown";
import GenderDropdown from "./GenderDropdown";
import SizeDropdown from "./SizeDropdown";
import ColorsDropdwon from "./ColorsDropdwon";
import PriceDropdown from "./PriceDropdown";
import SingleGridItem from "../Shop/SingleGridItem";
import SingleListItem from "../Shop/SingleListItem";
import { Product } from "@/types/product"; // Pastikan tipe Product Anda benar

// Tipe data untuk kategori yang diterima dari API (termasuk jumlah produk)
interface Category {
  id: string;
  name: string;
  _count?: {
    products: number;
  };
}

const ShopWithSidebar = () => {
  // --- State untuk Data Dinamis ---
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- State untuk UI (dipertahankan dari kode Anda) ---
  const [productStyle, setProductStyle] = useState("grid");
  const [productSidebar, setProductSidebar] = useState(false);
  const [stickyMenu, setStickyMenu] = useState(false);

  // --- Mengambil Data dari API ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [productResponse, categoryResponse] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories')
        ]);

        if (!productResponse.ok) throw new Error("Could not fetch products.");
        if (!categoryResponse.ok) throw new Error("Could not fetch categories.");

        const productData = await productResponse.json();
        const categoryData = await categoryResponse.json();

        setProducts(productData);
        setCategories(categoryData);
      } catch (err: any) {
        setError(err.message || "An unknown error occurred.");
        console.error("Shop data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- Semua logika UI Anda dipertahankan ---
  const handleStickyMenu = () => {
    if (window.scrollY >= 80) {
      setStickyMenu(true);
    } else {
      setStickyMenu(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleStickyMenu);

    function handleClickOutside(event: MouseEvent) {
      if (!(event.target as HTMLElement).closest(".sidebar-content")) {
        setProductSidebar(false);
      }
    }

    if (productSidebar) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleStickyMenu);
    };
  }, [productSidebar]); // Dependensi yang benar

  // Data statis Anda yang lama, dipertahankan untuk komponen yang belum dinamis
  const options = [
    { label: "Latest Products", value: "0" },
    { label: "Best Selling", value: "1" },
    { label: "Old Products", value: "2" },
  ];
  
  const genders = [
    { name: "Men", products: 10 },
    { name: "Women", products: 23 },
    { name: "Unisex", products: 8 },
  ];

  // --- JSX (Tampilan) ---
  // Desain Anda dipertahankan sepenuhnya
  return (
    <>
      <Breadcrumb
        title={"Explore All Products"}
        pages={["shop", "/", "shop with sidebar"]}
      />
      <section className="overflow-hidden relative pb-20 pt-5 lg:pt-20 xl:pt-28 bg-[#f3f4f6]">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex gap-7.5">
            {/* <!-- Sidebar Start --> */}
            <div
              className={`sidebar-content fixed xl:z-1 z-9999 left-0 top-0 xl:translate-x-0 xl:static max-w-[310px] xl:max-w-[270px] w-full ease-out duration-200 ${
                productSidebar
                  ? "translate-x-0 bg-white p-5 h-screen overflow-y-auto"
                  : "-translate-x-full"
              }`}
            >
              <button
                onClick={() => setProductSidebar(!productSidebar)}
                aria-label="button for product sidebar toggle"
                className={`xl:hidden absolute -right-12.5 sm:-right-8 flex items-center justify-center w-8 h-8 rounded-md bg-white shadow-1 ${
                  stickyMenu
                    ? "lg:top-20 sm:top-34.5 top-35"
                    : "lg:top-24 sm:top-39 top-37"
                }`}
              >
                <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M10.0068 3.44714C10.3121 3.72703 10.3328 4.20146 10.0529 4.5068L5.70494 9.25H20C20.4142 9.25 20.75 9.58579 20.75 10C20.75 10.4142 20.4142 10.75 20 10.75H4.00002C3.70259 10.75 3.43327 10.5742 3.3135 10.302C3.19374 10.0298 3.24617 9.71246 3.44715 9.49321L8.94715 3.49321C9.22704 3.18787 9.70147 3.16724 10.0068 3.44714Z" fill="currentColor"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M20.6865 13.698C20.5668 13.4258 20.2974 13.25 20 13.25L4.00001 13.25C3.5858 13.25 3.25001 13.5858 3.25001 14C3.25001 14.4142 3.5858 14.75 4.00001 14.75L18.2951 14.75L13.9472 19.4932C13.6673 19.7985 13.6879 20.273 13.9932 20.5529C14.2986 20.8328 14.773 20.8121 15.0529 20.5068L20.5529 14.5068C20.7539 14.2876 20.8063 13.9703 20.6865 13.698Z" fill="currentColor"/>
                </svg>
              </button>

              <form onSubmit={(e) => e.preventDefault()}>
                <div className="flex flex-col gap-6">
                  <div className="bg-white shadow-1 rounded-lg py-4 px-5">
                    <div className="flex items-center justify-between">
                      <p>Filters:</p>
                      <button className="text-blue">Clean All</button>
                    </div>
                  </div>
                  
                  {/* Dropdown Kategori sekarang menggunakan data dinamis */}
                  <CategoryDropdown categories={categories.map(cat => ({
                      name: cat.name,
                      products: cat._count?.products || 0,
                      isRefined: false, // Logika ini bisa dikembangkan lebih lanjut
                  }))} />
                  
                  <GenderDropdown genders={genders} />
                  <SizeDropdown />
                  <ColorsDropdwon />
                  <PriceDropdown />
                </div>
              </form>
            </div>
            {/* <!-- Sidebar End --> */}

            {/* <!-- Content Start --> */}
            <div className="xl:max-w-[870px] w-full">
              <div className="rounded-lg bg-white shadow-1 pl-3 pr-2.5 py-2.5 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-4">
                    <CustomSelect options={options} />
                    <p>
                      {/* Menampilkan jumlah produk dinamis */}
                      Showing <span className="text-dark">{products.length}</span> Products
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    {/* Tombol Grid/List */}
                  </div>
                </div>
              </div>

              {/* Tampilan Loading atau Error */}
              {loading && <p className="text-center py-10">Loading products...</p>}
              {error && <p className="text-center py-10 text-red-500">Error: {error}</p>}
              
              {/* <!-- Products Grid Start --> */}
              {!loading && !error && (
                <div
                  className={`${
                    productStyle === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-7.5 gap-y-9"
                      : "flex flex-col gap-7.5"
                  }`}
                >
                  {products.length > 0 ? (
                    products.map((item) =>
                      productStyle === "grid" ? (
                        <SingleGridItem item={item} key={item.id} />
                      ) : (
                        <SingleListItem item={item} key={item.id} />
                      )
                    )
                  ) : (
                    <p className="col-span-full text-center text-gray-500 py-10">No products found.</p>
                  )}
                </div>
              )}
              {/* <!-- Products Grid End --> */}

              {/* Pagination (dipertahankan dari kode Anda) */}
              <div className="flex justify-center mt-15">
                {/* JSX Pagination Anda tetap di sini */}
              </div>
            </div>
            {/* <!-- Content End --> */}
          </div>
        </div>
      </section>
    </>
  );
};

export default ShopWithSidebar;
