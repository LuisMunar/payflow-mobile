import { store } from '../src/app/store';
import { addProduct, cartStorage, clearCart } from '../src/features/cart/cartSlice';
import type { Product } from '../src/shared/types/api';

const product: Product = {
  id: 'product-1',
  available: true,
  currency: 'COP',
  description: 'Test product',
  imageUrl: 'https://example.test/product.jpg',
  name: 'Test product',
  priceInCents: 120000,
  stock: 3,
};

describe('store', () => {
  beforeEach(() => {
    jest.spyOn(cartStorage, 'persist').mockResolvedValue(undefined);
    store.dispatch(clearCart());
    jest.mocked(cartStorage.persist).mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('persists cart changes through listener middleware', async () => {
    store.dispatch(addProduct(product));
    await new Promise<void>(resolve => {
      setTimeout(resolve, 0);
    });

    expect(cartStorage.persist).toHaveBeenCalledWith([
      { product, quantity: 1 },
    ]);
  });
});
