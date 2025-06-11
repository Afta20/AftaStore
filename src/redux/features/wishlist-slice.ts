// File: src/redux/features/wishlist-slice.ts 

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "@/types/product"; // <-- 1. Impor tipe Product standar kita

type InitialState = {
  items: Product[];
};

const initialState: InitialState = {
  items: [],
};

export const wishlist = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    // 2. Action menerima payload dengan tipe Product
    addItemToWishlist: (state, action: PayloadAction<Product>) => {
      const newItem = action.payload;
      
      // Mencegah item yang sama ditambahkan berulang kali
      const existingItem = state.items.find((item) => item.id === newItem.id);
      if (!existingItem) {
        state.items.push(newItem); // Menambahkan seluruh objek Product ke state
      }
    },
    removeItemFromWishlist: (state, action: PayloadAction<string>) => {
      const itemId = action.payload;
      state.items = state.items.filter((item) => item.id !== itemId);
    },
    removeAllItemsFromWishlist: (state) => {
      state.items = [];
    },
  },
});

export const {
  addItemToWishlist,
  removeItemFromWishlist,
  removeAllItemsFromWishlist,
} = wishlist.actions;
export default wishlist.reducer;