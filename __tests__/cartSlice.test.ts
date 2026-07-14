import cartReducer, {
  addProduct,
  clearCart,
  decrementProduct,
  initialCartState,
} from '../src/features/cart/cartSlice';
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

describe('cartSlice', () => {
  it('adds new products and increments existing quantities', () => {
    const state = cartReducer(
      cartReducer(initialCartState, addProduct(product)),
      addProduct(product),
    );

    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(2);
  });

  it('decrements products and removes zero quantity items', () => {
    const withItem = cartReducer(initialCartState, addProduct(product));
    const state = cartReducer(withItem, decrementProduct(product.id));

    expect(state.items).toEqual([]);
  });

  it('clears the cart', () => {
    const withItem = cartReducer(initialCartState, addProduct(product));

    expect(cartReducer(withItem, clearCart())).toEqual(initialCartState);
  });
});
