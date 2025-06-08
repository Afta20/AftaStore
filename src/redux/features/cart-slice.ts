import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { Product } from "@/types/product"; // <-- 1. Impor tipe Product standar

// 2. Definisikan CartItem sebagai gabungan dari Product + quantity
type CartItem = Product & {
  quantity: number;
};

type InitialState = {
  items: CartItem[];
};

const initialState: InitialState = {
  items: [],
};

export const cart = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // 3. Perbaiki reducer untuk menangani data Product yang lengkap
    addItemToCart: (state, action: PayloadAction<Product>) => {
      const newItem = action.payload;
      const existingItem = state.items.find((item) => item.id === newItem.id);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({
          ...newItem, // Kirim semua properti dari Product (...newItem)
          quantity: 1, // Tambahkan quantity
        });
      }
    },
    removeItemFromCart: (state, action: PayloadAction<string>) => {
      const itemId = action.payload;
      state.items = state.items.filter((item) => item.id !== itemId);
    },
    updateCartItemQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      const { id, quantity } = action.payload;
      const existingItem = state.items.find((item) => item.id === id);

      if (existingItem) {
        existingItem.quantity = quantity;
      }
    },
    removeAllItemsFromCart: (state) => {
      state.items = [];
    },
  },
});

export const selectCartItems = (state: RootState) => state.cartReducer.items;

export const selectTotalPrice = createSelector([selectCartItems], (items) => {
  return items.reduce((total, item) => {
    return total + item.discountedPrice * item.quantity;
  }, 0);
});

export const {
  addItemToCart,
  removeItemFromCart,
  updateCartItemQuantity,
  removeAllItemsFromCart,
} = cart.actions;
export default cart.reducer;