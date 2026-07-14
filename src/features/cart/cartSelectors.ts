import type { RootState } from '../../app/store';

export const selectCartItems = (state: RootState) => state.cart.items;

export const selectCartItemCount = (state: RootState) =>
  state.cart.items.reduce((total, item) => total + item.quantity, 0);

export const selectCartTotalInCents = (state: RootState) =>
  state.cart.items.reduce(
    (total, item) => total + item.product.priceInCents * item.quantity,
    0,
  );

export const selectCartCurrency = (state: RootState) =>
  state.cart.items[0]?.product.currency ?? 'COP';

export const selectHasCartItems = (state: RootState) =>
  state.cart.items.length > 0;
