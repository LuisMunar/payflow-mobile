import { configureStore, createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';

import cartReducer, {
  addProduct,
  cartStorage,
  clearCart,
  decrementProduct,
  removeProduct,
  setProductQuantity,
} from '../features/cart/cartSlice';
import checkoutReducer from '../features/checkout/checkoutSlice';
import productsReducer from '../features/products/productsSlice';

const cartPersistenceMiddleware = createListenerMiddleware();

const reducer = {
  cart: cartReducer,
  checkout: checkoutReducer,
  products: productsReducer,
};

export const store = configureStore({
  reducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().prepend(cartPersistenceMiddleware.middleware),
});

cartPersistenceMiddleware.startListening({
  matcher: isAnyOf(
    addProduct,
    clearCart,
    decrementProduct,
    removeProduct,
    setProductQuantity,
  ),
  effect: async (_action, listenerApi) => {
    const state = listenerApi.getState() as RootState;

    await cartStorage.persist(state.cart.items);
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
