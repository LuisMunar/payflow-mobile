import type { Product } from '../types/api';
import { apiRequest } from './client';

export const productsApi = {
  list: () => apiRequest<Product[]>('/products'),
  getById: (productId: string) => apiRequest<Product>(`/products/${productId}`),
};
