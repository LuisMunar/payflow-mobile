import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { Product } from '../../shared/types/api';

export type CartItem = {
  product: Product;
  quantity: number;
};

export type CartState = {
  items: CartItem[];
};

export const initialCartState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: initialCartState,
  reducers: {
    addProduct(state, action: PayloadAction<Product>) {
      const current = state.items.find(
        item => item.product.id === action.payload.id,
      );

      if (current) {
        current.quantity += 1;
        return;
      }

      state.items.push({ product: action.payload, quantity: 1 });
    },
    decrementProduct(state, action: PayloadAction<string>) {
      const current = state.items.find(item => item.product.id === action.payload);

      if (!current) {
        return;
      }

      current.quantity -= 1;

      if (current.quantity <= 0) {
        state.items = state.items.filter(
          item => item.product.id !== action.payload,
        );
      }
    },
    clearCart(state) {
      state.items = [];
    },
  },
});

export const { addProduct, clearCart, decrementProduct } = cartSlice.actions;
export default cartSlice.reducer;
