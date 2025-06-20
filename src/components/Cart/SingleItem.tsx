// File: src/components/Cart/SingleItem.tsx
"use client";
import React, { useState, useEffect } from "react";
import { AppDispatch } from "@/redux/store";
import { useDispatch } from "react-redux";
import {
  removeItemFromCart,
  updateCartItemQuantity,
} from "@/redux/features/cart-slice";
import { CartItem } from "@/redux/features/cart-slice"; // Impor tipe CartItem
import Image from "next/image";
import { FiImage } from "react-icons/fi"; // Ikon untuk placeholder gambar

// Gunakan tipe CartItem yang benar untuk prop
const SingleItem = ({ item }: { item: CartItem }) => {
  // Gunakan useEffect untuk menyinkronkan state quantity dengan Redux
  const [quantity, setQuantity] = useState(item.quantity);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    setQuantity(item.quantity);
  }, [item.quantity]);

  const handleRemoveFromCart = () => {
    dispatch(removeItemFromCart(item.id));
  };

  const handleUpdateQuantity = (newQuantity: number) => {
    if (newQuantity < 1) return; // Jangan biarkan kuantitas kurang dari 1
    setQuantity(newQuantity);
    dispatch(updateCartItemQuantity({ id: item.id, quantity: newQuantity }));
  };

  // === PERBAIKAN LOGIKA ADA DI SINI ===
  const imageUrl = item.imagePreviews && item.imagePreviews.length > 0 ? item.imagePreviews[0] : null;
  const displayPrice = item.discountedPrice ?? item.price; // Gunakan harga diskon, atau harga normal jika tidak ada
  const subtotal = displayPrice * quantity;

  return (
    <div className="flex items-center border-t border-gray-200 dark:border-gray-700 py-5 px-7.5">
      <div className="min-w-[400px]">
        <div className="flex items-center gap-5.5">
          <div className="flex items-center justify-center rounded-[5px] bg-gray-100 dark:bg-gray-700 w-20 h-20">
            {/* Tampilkan gambar dari sumber yang benar, atau tampilkan placeholder */}
            {imageUrl ? (
                <Image width={80} height={80} src={imageUrl} alt={item.title || "Product"} className="object-contain" />
            ) : (
                <FiImage className="text-gray-400 dark:text-gray-500" size={24} />
            )}
          </div>
          <div>
            <h3 className="font-medium text-dark dark:text-white ease-out duration-200 hover:text-blue-600">
              <a href="#"> {item.title} </a>
            </h3>
          </div>
        </div>
      </div>

      <div className="min-w-[180px]">
        {/* Tampilkan harga yang benar, dan format dengan Rupiah */}
        <p className="font-medium text-dark dark:text-white">Rp{displayPrice.toLocaleString('id-ID')}</p>
      </div>

      <div className="min-w-[275px]">
        <div className="w-max flex items-center rounded-md border border-gray-300 dark:border-gray-600">
          <button
            onClick={() => handleUpdateQuantity(quantity - 1)}
            aria-label="button for remove product"
            className="flex items-center justify-center w-11.5 h-11.5 ease-out duration-200 hover:text-blue-600"
          >
            <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.33301 10.0001C3.33301 9.53984 3.7061 9.16675 4.16634 9.16675H15.833C16.2932 9.16675 16.6663 9.53984 16.6663 10.0001C16.6663 10.4603 16.2932 10.8334 15.833 10.8334H4.16634C3.7061 10.8334 3.33301 10.4603 3.33301 10.0001Z" fill="currentColor"/>
            </svg>
          </button>
          <span className="flex items-center justify-center w-16 h-11.5 border-x border-gray-300 dark:border-gray-600 text-dark dark:text-white">
            {quantity}
          </span>
          <button
            onClick={() => handleUpdateQuantity(quantity + 1)}
            aria-label="button for add product"
            className="flex items-center justify-center w-11.5 h-11.5 ease-out duration-200 hover:text-blue-600"
          >
            <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.33301 10C3.33301 9.5398 3.7061 9.16671 4.16634 9.16671H15.833C16.2932 9.16671 16.6663 9.5398 16.6663 10C16.6663 10.4603 16.2932 10.8334 15.833 10.8334H4.16634C3.7061 10.8334 3.33301 10.4603 3.33301 10Z" fill="currentColor"/>
              <path d="M9.99967 16.6667C9.53944 16.6667 9.16634 16.2936 9.16634 15.8334L9.16634 4.16671C9.16634 3.70647 9.53944 3.33337 9.99967 3.33337C10.4599 3.33337 10.833 3.70647 10.833 4.16671L10.833 15.8334C10.833 16.2936 10.4599 16.6667 9.99967 16.6667Z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="min-w-[200px]">
        {/* Tampilkan subtotal yang benar, dan format dengan Rupiah */}
        <p className="font-medium text-dark dark:text-white">Rp{subtotal.toLocaleString('id-ID')}</p>
      </div>

      <div className="min-w-[50px] flex justify-end">
        <button
          onClick={() => handleRemoveFromCart()}
          aria-label="button for remove product from cart"
          className="flex items-center justify-center rounded-lg w-9.5 h-9.5 text-gray-500 hover:bg-red-100 hover:text-red-500 transition-colors"
        >
          <svg className="fill-current" width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
            {/* SVG Path untuk ikon hapus */}
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SingleItem;
