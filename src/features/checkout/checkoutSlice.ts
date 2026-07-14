import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { CardBrand } from '../../shared/validation/cardValidation';

export type CheckoutStep = 'cart' | 'card' | 'summary' | 'processing' | 'result';

export type CardSummary = {
  brand: CardBrand;
  cardHolder: string;
  lastFour: string;
};

export type CheckoutState = {
  cardSummary: CardSummary | null;
  step: CheckoutStep;
  customerName: string;
  customerEmail: string;
};

export const initialCheckoutState: CheckoutState = {
  cardSummary: null,
  step: 'cart',
  customerName: '',
  customerEmail: '',
};

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState: initialCheckoutState,
  reducers: {
    setCustomer(
      state,
      action: PayloadAction<{ customerName: string; customerEmail: string }>,
    ) {
      state.customerName = action.payload.customerName;
      state.customerEmail = action.payload.customerEmail;
    },
    setCheckoutStep(state, action: PayloadAction<CheckoutStep>) {
      state.step = action.payload;
    },
    setCardSummary(state, action: PayloadAction<CardSummary>) {
      state.cardSummary = action.payload;
    },
    clearCardSummary(state) {
      state.cardSummary = null;
    },
    resetCheckout() {
      return initialCheckoutState;
    },
  },
});

export const {
  clearCardSummary,
  resetCheckout,
  setCardSummary,
  setCheckoutStep,
  setCustomer,
} = checkoutSlice.actions;
export default checkoutSlice.reducer;
