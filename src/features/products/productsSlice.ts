import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { productsApi } from '../../shared/api/productsApi';
import type { Product } from '../../shared/types/api';

export type ProductsState = {
  items: Product[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
};

export const initialProductsState: ProductsState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchProducts = createAsyncThunk('products/fetchAll', async () => {
  return productsApi.list();
});

const productsSlice = createSlice({
  name: 'products',
  initialState: initialProductsState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchProducts.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          action.error.message ?? 'We could not load the product catalog.';
      });
  },
});

export default productsSlice.reducer;
