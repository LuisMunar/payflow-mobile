import productsReducer, {
  fetchProducts,
  initialProductsState,
} from '../src/features/products/productsSlice';
import type { Product } from '../src/shared/types/api';

const products: Product[] = [
  {
    id: 'product-1',
    available: true,
    currency: 'COP',
    description: 'Test product',
    imageUrl: 'https://example.test/product.jpg',
    name: 'Test product',
    priceInCents: 120000,
    stock: 3,
  },
];

describe('productsSlice', () => {
  it('tracks loading state', () => {
    const state = productsReducer(initialProductsState, fetchProducts.pending('1'));

    expect(state.status).toBe('loading');
    expect(state.error).toBeNull();
  });

  it('stores fetched products', () => {
    const state = productsReducer(
      initialProductsState,
      fetchProducts.fulfilled(products, '1'),
    );

    expect(state.status).toBe('succeeded');
    expect(state.items).toEqual(products);
  });

  it('stores load errors', () => {
    const state = productsReducer(
      initialProductsState,
      fetchProducts.rejected(new Error('Network error'), '1'),
    );

    expect(state.status).toBe('failed');
    expect(state.error).toBe('Network error');
  });
});
