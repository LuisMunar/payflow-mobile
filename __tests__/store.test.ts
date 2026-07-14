import { store } from '../src/app/store';
import { addProduct, cartStorage, clearCart } from '../src/features/cart/cartSlice';
import {
  checkoutStorage,
  resetCheckout,
  setCustomer,
} from '../src/features/checkout/checkoutSlice';
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
    jest.spyOn(checkoutStorage, 'persist').mockResolvedValue(undefined);
    store.dispatch(clearCart());
    store.dispatch(resetCheckout());
    jest.mocked(cartStorage.persist).mockClear();
    jest.mocked(checkoutStorage.persist).mockClear();
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

  it('persists safe checkout changes through listener middleware', async () => {
    store.dispatch(
      setCustomer({
        customerEmail: 'luis@example.com',
        customerName: 'Luis Munar',
      }),
    );
    await new Promise<void>(resolve => {
      setTimeout(resolve, 0);
    });

    expect(checkoutStorage.persist).toHaveBeenCalledWith(
      expect.objectContaining({
        customerEmail: 'luis@example.com',
        customerName: 'Luis Munar',
      }),
    );
  });
});
