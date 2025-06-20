// File: src/components/Common/CartSidebarModal/index.tsx
"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import {
  selectTotalPrice,
} from "@/redux/features/cart-slice";
import { useAppSelector } from "@/redux/store";
import { useSelector } from "react-redux";
import SingleItem from "./SingleItem"; // Pastikan path ini benar
import Link from "next/link";
import EmptyCart from "./EmptyCart"; // Pastikan path ini benar

const CartSidebarModal = () => {
  const { isCartModalOpen, closeCartModal } = useCartModalContext();
  const cartItems = useAppSelector((state) => state.cartReducer.items);
  const router = useRouter();

  const totalPrice = useSelector(selectTotalPrice);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!(event.target as HTMLElement).closest(".modal-content")) {
        closeCartModal();
      }
    }

    if (isCartModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCartModalOpen, closeCartModal]);

  return (
    <div
      className={`fixed top-0 left-0 z-99999 overflow-y-auto no-scrollbar w-full h-screen bg-dark/70 ease-linear duration-300 ${
        isCartModalOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex items-center justify-end">
        <div className="w-full max-w-[500px] shadow-1 bg-white dark:bg-gray-900 px-4 sm:px-7.5 lg:px-11 relative modal-content">
          <div className="sticky top-0 bg-white dark:bg-gray-900 flex items-center justify-between pb-7 pt-4 sm:pt-7.5 lg:pt-11 border-b border-gray-300 dark:border-gray-700 mb-7.5">
            <h2 className="font-medium text-dark dark:text-white text-lg sm:text-2xl">
              Cart View
            </h2>
            <button
              onClick={() => closeCartModal()}
              aria-label="button for close modal"
              className="flex items-center justify-center ease-in duration-150 text-dark dark:text-white hover:text-blue-600"
            >
              <svg className="fill-current" width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.5379 11.2121C12.1718 10.846 11.5782 10.846 11.212 11.2121C10.8459 11.5782 10.8459 12.1718 11.212 12.5379L13.6741 15L11.2121 17.4621C10.846 17.8282 10.846 18.4218 11.2121 18.7879C11.5782 19.154 12.1718 19.154 12.5379 18.7879L15 16.3258L17.462 18.7879C17.8281 19.154 18.4217 19.154 18.7878 18.7879C19.154 18.4218 19.154 17.8282 18.7878 17.462L16.3258 15L18.7879 12.5379C19.154 12.1718 19.154 11.5782 18.7879 11.2121C18.4218 10.846 17.8282 10.846 17.462 11.2121L15 13.6742L12.5379 11.2121Z" fill="currentColor"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M15 1.5625C7.57867 1.5625 1.5625 7.57867 1.5625 15C1.5625 22.4213 7.57867 28.4375 15 28.4375C22.4213 28.4375 28.4375 22.4213 28.4375 15C28.4375 7.57867 22.4213 1.5625 15 1.5625ZM3.4375 15C3.4375 8.61421 8.61421 3.4375 15 3.4375C21.3858 3.4375 26.5625 8.61421 26.5625 15C26.5625 21.3858 21.3858 26.5625 15 26.5625C8.61421 26.5625 3.4375 21.3858 3.4375 15Z" fill="currentColor"/>
              </svg>
            </button>
          </div>

          <div className="h-[66vh] overflow-y-auto no-scrollbar">
            <div className="flex flex-col gap-6">
              {cartItems.length > 0 ? (
                cartItems.map((item) => (
                  // === PERUBAHAN DI SINI: Hapus prop removeItemFromCart ===
                  <SingleItem
                    key={item.id} // Gunakan item.id yang unik sebagai key
                    item={item}
                  />
                ))
              ) : (
                <EmptyCart />
              )}
            </div>
          </div>

          <div className="border-t border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 pt-5 pb-4 sm:pb-7.5 lg:pb-11 mt-7.5 sticky bottom-0">
            <div className="flex items-center justify-between gap-5 mb-6">
              <p className="font-medium text-xl text-dark dark:text-white">Subtotal:</p>
              <p className="font-medium text-xl text-dark dark:text-white">Rp.{totalPrice.toLocaleString('id-ID')}</p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  closeCartModal();
                  setTimeout(() => {
                    router.push("/cart");
                  }, 300); 
                }}
                className="w-full flex justify-center font-medium text-white bg-blue-600 py-[13px] px-6 rounded-md ease-out duration-200 hover:bg-blue-700"
              >
                View Cart
              </button>

              <button
                onClick={() => {
                  closeCartModal();
                  setTimeout(() => {
                    router.push("/checkout");
                  }, 300);
                }}
                className="w-full flex justify-center font-medium text-white bg-dark dark:bg-gray-700 py-[13px] px-6 rounded-md ease-out duration-200 hover:bg-opacity-95"
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSidebarModal;
