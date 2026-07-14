import { configureStore, createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';

import cartReducer, {
  addProduct,
  cartStorage,
  clearCart,
  decrementProduct,
  removeProduct,
  setProductQuantity,
} from '../features/cart/cartSlice';
import checkoutReducer, {
  checkoutStorage,
  clearCardSummary,
  resetCheckout,
  setCardSummary,
  setCustomer,
} from '../features/checkout/checkoutSlice';
import productsReducer from '../features/products/productsSlice';

const cartPersistenceMiddleware = createListenerMiddleware();
const checkoutPersistenceMiddleware = createListenerMiddleware();

const reducer = {
  cart: cartReducer,
  checkout: checkoutReducer,
  products: productsReducer,
};

export const store = configureStore({
  reducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().prepend(
      cartPersistenceMiddleware.middleware,
      checkoutPersistenceMiddleware.middleware,
    ),
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

checkoutPersistenceMiddleware.startListening({
  matcher: isAnyOf(setCustomer, setCardSummary, clearCardSummary, resetCheckout),
  effect: async (_action, listenerApi) => {
    const state = listenerApi.getState() as RootState;

    await checkoutStorage.persist(state.checkout);
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
