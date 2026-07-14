import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { Product } from '../../shared/types/api';
import { secureStorage } from '../../shared/storage/secureStorage';

export type CartItem = {
  product: Product;
  quantity: number;
};

export type CartState = {
  items: CartItem[];
  restored: boolean;
};

export const initialCartState: CartState = {
  items: [],
  restored: false,
};

const cartStorageKey = 'cart';

export const loadCart = createAsyncThunk('cart/load', async () => {
  return secureStorage.getJson<CartItem[]>(cartStorageKey);
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: initialCartState,
  reducers: {
    addProduct(state, action: PayloadAction<Product>) {
      const current = state.items.find(
        item => item.product.id === action.payload.id,
      );

      if (current) {
        current.quantity = Math.min(current.quantity + 1, current.product.stock);
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
    removeProduct(state, action: PayloadAction<string>) {
      state.items = state.items.filter(item => item.product.id !== action.payload);
    },
    setProductQuantity(
      state,
      action: PayloadAction<{ productId: string; quantity: number }>,
    ) {
      const current = state.items.find(
        item => item.product.id === action.payload.productId,
      );

      if (!current) {
        return;
      }

      const quantity = Math.min(action.payload.quantity, current.product.stock);

      if (quantity <= 0) {
        state.items = state.items.filter(
          item => item.product.id !== action.payload.productId,
        );
        return;
      }

      current.quantity = quantity;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadCart.fulfilled, (state, action) => {
        state.items = action.payload ?? [];
        state.restored = true;
      })
      .addCase(loadCart.rejected, state => {
        state.restored = true;
      });
  },
});

export const {
  addProduct,
  clearCart,
  decrementProduct,
  removeProduct,
  setProductQuantity,
} = cartSlice.actions;

export const cartStorage = {
  key: cartStorageKey,
  async persist(items: CartItem[]) {
    if (items.length === 0) {
      await secureStorage.remove(cartStorageKey);
      return;
    }

    await secureStorage.setJson(cartStorageKey, items);
  },
};

export default cartSlice.reducer;
