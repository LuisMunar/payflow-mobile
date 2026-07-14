import {
  selectCartCurrency,
  selectCartItemCount,
  selectCartItems,
  selectCartTotalInCents,
  selectHasCartItems,
} from '../src/features/cart/cartSelectors';
import type { RootState } from '../src/app/store';

const state = {
  cart: {
    items: [
      {
        product: {
          id: 'product-1',
          available: true,
          currency: 'COP',
          description: 'Test product',
          imageUrl: 'https://example.test/product.jpg',
          name: 'Test product',
          priceInCents: 120000,
          stock: 3,
        },
        quantity: 2,
      },
    ],
    restored: true,
  },
} as RootState;

describe('cartSelectors', () => {
  it('selects cart totals and metadata', () => {
    expect(selectCartItems(state)).toHaveLength(1);
    expect(selectCartItemCount(state)).toBe(2);
    expect(selectCartTotalInCents(state)).toBe(240000);
    expect(selectCartCurrency(state)).toBe('COP');
    expect(selectHasCartItems(state)).toBe(true);
  });
});
