import cartReducer, {
  addProduct,
  cartStorage,
  clearCart,
  decrementProduct,
  initialCartState,
  loadCart,
  removeProduct,
  setProductQuantity,
} from '../src/features/cart/cartSlice';
import type { Product } from '../src/shared/types/api';
import { secureStorage } from '../src/shared/storage/secureStorage';

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

jest.mock('../src/shared/storage/secureStorage', () => ({
  secureStorage: {
    getJson: jest.fn(),
    remove: jest.fn(),
    setJson: jest.fn(),
  },
}));

describe('cartSlice', () => {
  it('adds new products and increments existing quantities', () => {
    const state = cartReducer(
      cartReducer(initialCartState, addProduct(product)),
      addProduct(product),
    );

    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(2);
  });

  it('does not increment beyond product stock', () => {
    const state = [1, 2, 3, 4].reduce(
      current => cartReducer(current, addProduct(product)),
      initialCartState,
    );

    expect(state.items[0].quantity).toBe(3);
  });

  it('decrements products and removes zero quantity items', () => {
    const withItem = cartReducer(initialCartState, addProduct(product));
    const state = cartReducer(withItem, decrementProduct(product.id));

    expect(state.items).toEqual([]);
  });

  it('decrements products without removing positive quantities', () => {
    const withTwoItems = cartReducer(
      cartReducer(initialCartState, addProduct(product)),
      addProduct(product),
    );
    const state = cartReducer(withTwoItems, decrementProduct(product.id));

    expect(state.items).toEqual([{ product, quantity: 1 }]);
  });

  it('ignores decrement and quantity changes for unknown products', () => {
    const decremented = cartReducer(initialCartState, decrementProduct('missing'));
    const updated = cartReducer(
      initialCartState,
      setProductQuantity({ productId: 'missing', quantity: 2 }),
    );

    expect(decremented).toEqual(initialCartState);
    expect(updated).toEqual(initialCartState);
  });

  it('sets and removes product quantities', () => {
    const withItem = cartReducer(initialCartState, addProduct(product));
    const withQuantity = cartReducer(
      withItem,
      setProductQuantity({ productId: product.id, quantity: 2 }),
    );
    const removed = cartReducer(
      withQuantity,
      setProductQuantity({ productId: product.id, quantity: 0 }),
    );

    expect(withQuantity.items[0].quantity).toBe(2);
    expect(removed.items).toEqual([]);
  });

  it('removes products by id', () => {
    const withItem = cartReducer(initialCartState, addProduct(product));

    expect(cartReducer(withItem, removeProduct(product.id)).items).toEqual([]);
  });

  it('clears the cart', () => {
    const withItem = cartReducer(initialCartState, addProduct(product));

    expect(cartReducer(withItem, clearCart())).toEqual(initialCartState);
  });

  it('restores persisted cart items', () => {
    const restored = cartReducer(
      initialCartState,
      loadCart.fulfilled([{ product, quantity: 1 }], 'request-id'),
    );

    expect(restored.items).toEqual([{ product, quantity: 1 }]);
    expect(restored.restored).toBe(true);
  });

  it('marks cart as restored when persisted cart loading fails', () => {
    const restored = cartReducer(
      initialCartState,
      loadCart.rejected(new Error('Storage error'), 'request-id'),
    );

    expect(restored.restored).toBe(true);
  });

  it('persists and removes cart storage safely', async () => {
    await cartStorage.persist([{ product, quantity: 1 }]);
    await cartStorage.persist([]);

    expect(secureStorage.setJson).toHaveBeenCalledWith(cartStorage.key, [
      { product, quantity: 1 },
    ]);
    expect(secureStorage.remove).toHaveBeenCalledWith(cartStorage.key);
  });
});
