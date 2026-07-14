import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { Transaction } from '../../shared/types/api';
import type { CardBrand } from '../../shared/validation/cardValidation';

export type CheckoutStep = 'cart' | 'card' | 'summary' | 'processing' | 'result';
export type PaymentStatus = 'idle' | 'processing' | 'succeeded' | 'failed';

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
  paymentError: string | null;
  paymentResult: Transaction | null;
  paymentStatus: PaymentStatus;
};

export const initialCheckoutState: CheckoutState = {
  cardSummary: null,
  step: 'cart',
  customerName: '',
  customerEmail: '',
  paymentError: null,
  paymentResult: null,
  paymentStatus: 'idle',
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
    setPaymentProcessing(state) {
      state.paymentError = null;
      state.paymentStatus = 'processing';
      state.step = 'processing';
    },
    setPaymentResult(state, action: PayloadAction<Transaction>) {
      state.paymentError = null;
      state.paymentResult = action.payload;
      state.paymentStatus = 'succeeded';
      state.step = 'result';
    },
    setPaymentError(state, action: PayloadAction<string>) {
      state.paymentError = action.payload;
      state.paymentStatus = 'failed';
      state.step = 'result';
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
  setPaymentError,
  setPaymentProcessing,
  setPaymentResult,
} = checkoutSlice.actions;
export default checkoutSlice.reducer;
