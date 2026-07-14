import productsReducer, {
  fetchProducts,
  initialProductsState,
} from '../src/features/products/productsSlice';
import { productsApi } from '../src/shared/api/productsApi';
import type { Product } from '../src/shared/types/api';

jest.mock('../src/shared/api/productsApi', () => ({
  productsApi: {
    list: jest.fn(),
  },
}));

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
  beforeEach(() => {
    jest.mocked(productsApi.list).mockReset();
  });

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

  it('stores a fallback load error when no message is available', () => {
    const state = productsReducer(initialProductsState, {
      type: fetchProducts.rejected.type,
      error: {},
    });

    expect(state.status).toBe('failed');
    expect(state.error).toBe('We could not load the product catalog.');
  });

  it('loads products through the API thunk', async () => {
    jest.mocked(productsApi.list).mockResolvedValue(products);
    const dispatch = jest.fn();

    await fetchProducts()(dispatch, () => ({}), undefined);

    expect(productsApi.list).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: fetchProducts.fulfilled.type }),
    );
  });
});
