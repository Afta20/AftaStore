// File: src/app/wishlist/page.tsx (Versi Final dengan Tombol Inline CSS)
"use client";

import React from "react";
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from "@/redux/store";
import { removeItemFromWishlist, removeAllItemsFromWishlist } from '@/redux/features/wishlist-slice';
import { addItemToCart } from '@/redux/features/cart-slice';
import { Product } from "@/types/product";
import Link from "next/link";
import Image from "next/image";
import toast from 'react-hot-toast';
import Breadcrumb from "@/components/Common/Breadcrumb"; // Sesuaikan path jika perlu
import { FiShoppingCart, FiTrash2, FiImage } from "react-icons/fi";

const WishlistPage = () => {
  const wishlistItems = useSelector((state: RootState) => state.wishlistReducer.items);
  const dispatch = useDispatch<AppDispatch>();

  const handleClearWishlist = () => {
    if (window.confirm("Are you sure you want to clear your entire wishlist?")) {
      dispatch(removeAllItemsFromWishlist());
      toast.success("Wishlist cleared!");
    }
  };
  
  const handleRemoveItem = (productId: string) => {
    dispatch(removeItemFromWishlist(productId));
    toast.success("Item removed from wishlist.");
  };

  const handleAddToCart = (product: Product) => {
    dispatch(addItemToCart(product));
    toast.success(`${product.title} added to cart!`);
  };

  return (
    <>
      <Breadcrumb title={"Wishlist"} pages={["Home", "/", "Wishlist"]} />
      <section className="overflow-hidden py-20 bg-gray-2 dark:bg-gray-900">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-wrap items-center justify-between gap-5 mb-7.5">
            <h2 className="font-medium text-dark dark:text-white text-2xl">Your Wishlist ({wishlistItems.length})</h2>
            {wishlistItems.length > 0 && (
              <button onClick={handleClearWishlist} className="text-red-500 hover:text-red-700 font-medium transition-colors">
                Clear Wishlist
              </button>
            )}
          </div>
          
          {wishlistItems.length === 0 ? (
             <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-lg shadow-1">
                <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">Your wishlist is empty.</p>
                <Link href="/" className="mt-6 inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
                  Discover Products
                </Link>
             </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-[10px] shadow-1">
              <div className="w-full overflow-x-auto">
                <div className="min-w-[1170px]">
                  {/* <!-- table header --> */}
                  <div className="flex items-center py-5.5 px-10 border-b border-gray-2 dark:border-gray-700">
                    <div className="min-w-[83px]"></div>
                    <div className="min-w-[387px]">
                      <p className="text-dark dark:text-white font-medium">Product</p>
                    </div>
                    <div className="min-w-[205px]">
                      <p className="text-dark dark:text-white font-medium">Unit Price</p>
                    </div>
                    <div className="min-w-[265px]">
                      <p className="text-dark dark:text-white font-medium">Stock Status</p>
                    </div>
                    <div className="min-w-[150px]">
                      <p className="text-dark dark:text-white font-medium text-right">Action</p>
                    </div>
                  </div>

                  {/* <!-- wish item --> */}
                  {wishlistItems.map((item) => {
                    const imageUrl = item.imagePreviews && item.imagePreviews.length > 0 ? item.imagePreviews[0] : null;
                    const displayPrice = item.discountedPrice ?? item.price;
                    const stockStatus = item.stock && item.stock > 0 ? "In Stock" : "Out of Stock";
                    const isOutOfStock = stockStatus === "Out of Stock";

                    // === STYLE UNTUK TOMBOL ADD TO CART ===
                    const cartButtonStyle: React.CSSProperties = {
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 1rem',
                      backgroundColor: isOutOfStock ? '#9CA3AF' : '#2563EB', // Abu-abu jika disabled, biru jika aktif
                      color: 'white',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      border: 'none',
                      transition: 'background-color 0.2s',
                      cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                      opacity: isOutOfStock ? 0.5 : 1,
                    };

                    return (
                      <div key={item.id} className="flex items-center border-t border-gray-2 dark:border-gray-700 py-5.5 px-10">
                        <div className="min-w-[83px] pr-4">
                          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                            {imageUrl ? (
                              <Image src={imageUrl} alt={item.title || "Product"} width={80} height={80} className="object-contain" />
                            ) : (
                              <FiImage className="text-gray-400 dark:text-gray-500" size={24} />
                            )}
                          </div>
                        </div>
                        <div className="min-w-[387px]">
                          <Link href={`/shop-details/${item.id}`} className="font-medium text-dark dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                            {item.title}
                          </Link>
                        </div>
                        <div className="min-w-[205px]">
                          <p className="font-medium text-dark dark:text-white">
                            Rp {displayPrice.toLocaleString('id-ID')}
                          </p>
                          {item.discountedPrice && (
                             <p className="text-sm text-gray-500 line-through">
                               Rp {item.price.toLocaleString('id-ID')}
                             </p>
                          )}
                        </div>
                        <div className="min-w-[265px]">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${stockStatus === "In Stock" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                            {stockStatus}
                          </span>
                        </div>
                        <div className="min-w-[150px] flex justify-end items-center gap-3">
                          {/* === TOMBOL ADD TO CART MENGGUNAKAN INLINE CSS === */}
                          <button
                            onClick={() => handleAddToCart(item)}
                            disabled={isOutOfStock}
                            style={cartButtonStyle}
                            title="Add to Cart"
                            onMouseOver={(e) => { if (!isOutOfStock) e.currentTarget.style.backgroundColor = '#1D4ED8'; }}
                            onMouseOut={(e) => { if (!isOutOfStock) e.currentTarget.style.backgroundColor = '#2563EB'; }}
                          >
                            <FiShoppingCart size={16} />
                            Add to Cart
                          </button>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-2 text-gray-500 hover:text-red-500"
                            title="Remove from Wishlist"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default WishlistPage;
