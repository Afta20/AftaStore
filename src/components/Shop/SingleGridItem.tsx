// File: src/components/Shop/SingleGridItem.tsx
"use client";
import React from "react";
import { Product } from "@/types/product";
import { useModalContext } from "@/app/context/QuickViewModalContext";
import { updateQuickView } from "@/redux/features/quickView-slice";
import { addItemToCart } from "@/redux/features/cart-slice";
import { addItemToWishlist } from "@/redux/features/wishlist-slice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import Link from "next/link";
import Image from "next/image";
import { FiImage } from "react-icons/fi";

const SingleGridItem = ({ item }: { item: Product }) => {
  const { openModal } = useModalContext();
  const dispatch = useDispatch<AppDispatch>();

  const imageUrl = item.imagePreviews && item.imagePreviews.length > 0 ? item.imagePreviews[0] : null;

  const handleQuickViewUpdate = () => {
    dispatch(updateQuickView({ ...item }));
  };

  const handleAddToCart = () => {
    dispatch(addItemToCart(item));
  };

  const handleItemToWishList = () => {
    dispatch(addItemToWishlist(item));
  };
  
  return (
    <div className="group">
      <div className="relative overflow-hidden flex items-center justify-center rounded-lg bg-white dark:bg-gray-800 shadow-1 min-h-[270px] mb-4">
        {imageUrl ? (
          <Image src={imageUrl} alt={item.title || "Product image"} width={250} height={250} className="object-contain w-full h-full p-4 group-hover:scale-105 transition-transform duration-300 ease-in-out"/>
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400">
            <FiImage size={48} /><span className="text-xs mt-2">No Image</span>
          </div>
        )}

        <div className="absolute left-0 bottom-0 translate-y-full w-full flex items-center justify-center gap-2.5 pb-5 ease-linear duration-200 group-hover:translate-y-0">
          <button onClick={() => { openModal(); handleQuickViewUpdate(); }} aria-label="button for quick view" className="flex items-center justify-center w-9 h-9 rounded-[5px] shadow-1 ease-out duration-200 text-dark bg-white hover:text-blue-600">
            <svg className="fill-current" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M8.00016 5.5C6.61945 5.5 5.50016 6.61929 5.50016 8C5.50016 9.38071 6.61945 10.5 8.00016 10.5C9.38087 10.5 10.5002 9.38071 10.5002 8C10.5002 6.61929 9.38087 5.5 8.00016 5.5ZM6.50016 8C6.50016 7.17157 7.17174 6.5 8.00016 6.5C8.82859 6.5 9.50016 7.17157 9.50016 8C9.50016 8.82842 8.82859 9.5 8.00016 9.5C7.17174 9.5 6.50016 8.82842 6.50016 8Z" fill="currentColor"/><path d="M8.00016 2.16666C4.99074 2.16666 2.96369 3.96946 1.78721 5.49791L1.76599 5.52546C1.49992 5.87102 1.25487 6.18928 1.08862 6.5656C0.910592 6.96858 0.833496 7.40779 0.833496 8C0.833496 8.5922 0.910592 9.03142 1.08862 9.4344C1.25487 9.81072 1.49992 10.129 1.76599 10.4745L1.78721 10.5021C2.96369 12.0305 4.99074 13.8333 8.00016 13.8333C11.0096 13.8333 13.0366 12.0305 14.2131 10.5021L14.2343 10.4745C14.5004 10.129 14.7455 9.81072 14.9117 9.4344C15.0897 9.03142 15.1668 8.5922 15.1668 8C15.1668 7.40779 15.0897 6.96858 14.9117 6.5656C14.7455 6.18927 14.5004 5.87101 14.2343 5.52545L14.2131 5.49791C13.0366 3.96946 11.0096 2.16666 8.00016 2.16666ZM2.57964 6.10786C3.66592 4.69661 5.43374 3.16666 8.00016 3.16666C10.5666 3.16666 12.3344 4.69661 13.4207 6.10786C13.7131 6.48772 13.8843 6.7147 13.997 6.9697C14.1023 7.20801 14.1668 7.49929 14.1668 8C14.1668 8.50071 14.1023 8.79199 13.997 9.0303C13.8843 9.28529 13.7131 9.51227 13.4207 9.89213C12.3344 11.3034 10.5666 12.8333 8.00016 12.8333C5.43374 12.8333 3.66592 11.3034 2.57964 9.89213C2.28725 9.51227 2.11599 9.28529 2.00334 9.0303C1.89805 8.79199 1.8335 8.50071 1.8335 8C1.8335 7.49929 1.89805 7.20801 2.00334 6.9697C2.11599 6.7147 2.28725 6.48772 2.57964 6.10786Z" fill="currentColor"/></svg>
          </button>
          <button
            onClick={() => handleAddToCart()}
            style={{
              display: 'inline-flex', fontWeight: 500, fontSize: '0.8125rem', padding: '7px 20px',
              borderRadius: '5px', backgroundColor: '#3b82f6', color: 'white',
              transition: 'background-color 0.2s ease-out', border: 'none', cursor: 'pointer'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
          >
            Add to cart
          </button>
          <button onClick={() => handleItemToWishList()} aria-label="button for favorite select" className="flex items-center justify-center w-9 h-9 rounded-[5px] shadow-1 ease-out duration-200 text-dark bg-white hover:text-blue-600">
            <svg className="fill-current" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M7.99992 2.97255C6.45855 1.5935 4.73256 1.40058 3.33376 2.03998C1.85639 2.71528 0.833252 4.28336 0.833252 6.0914C0.833252 7.86842 1.57358 9.22404 2.5444 10.3172C3.32183 11.1926 4.2734 11.9253 5.1138 12.5724C5.30431 12.7191 5.48911 12.8614 5.66486 12.9999C6.00636 13.2691 6.37295 13.5562 6.74447 13.7733C7.11582 13.9903 7.53965 14.1667 7.99992 14.1667C8.46018 14.1667 8.88401 13.9903 9.25537 13.7733C9.62689 13.5562 9.99348 13.2691 10.335 12.9999C10.5107 12.8614 10.6955 12.7191 10.886 12.5724C11.7264 11.9253 12.678 11.1926 13.4554 10.3172C14.4263 9.22404 15.1666 7.86842 15.1666 6.0914C15.1666 4.28336 14.1434 2.71528 12.6661 2.03998C11.2673 1.40058 9.54129 1.5935 7.99992 2.97255Z" fill="currentColor"/></svg>
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2.5 mb-2">
        <div className="flex items-center gap-1">
          <Image src="/images/icons/icon-star.svg" alt="star icon" width={15} height={15} />
          <Image src="/images/icons/icon-star.svg" alt="star icon" width={15} height={15} />
          <Image src="/images/icons/icon-star.svg" alt="star icon" width={15} height={15} />
          <Image src="/images/icons/icon-star.svg" alt="star icon" width={15} height={15} />
          <Image src="/images/icons/icon-star.svg" alt="star icon" width={15} height={15} />
        </div>
        <p className="text-custom-sm">({item.reviews || 0})</p>
      </div>
      <h3 className="font-medium text-dark dark:text-white ease-out duration-200 hover:text-blue-600 mb-1.5">
        <Link href={`/shop-details/${item.id}`}>{item.title}</Link>
      </h3>
      <span className="flex items-center gap-2 font-medium text-lg">
        <span className="text-dark dark:text-white">Rp.{ (item.discountedPrice ?? item.price).toLocaleString('id-ID') }</span>
        {item.discountedPrice && <span className="text-dark-4 line-through">Rp.{item.price.toLocaleString('id-ID')}</span>}
      </span>
    </div>
  );
};

export default SingleGridItem;
