import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { secureStorage } from '../../shared/storage/secureStorage';
import type { Transaction } from '../../shared/types/api';
import type { CardBrand } from '../../shared/validation/cardValidation';

export type CheckoutStep = 'cart' | 'card' | 'summary' | 'processing' | 'result';
export type PaymentStatus = 'idle' | 'processing' | 'succeeded' | 'failed';

export type CardSummary = {
  brand: CardBrand;
  cardHolder: string;
  lastFour: string;
};

export type CheckoutDraft = {
  cardSummary: CardSummary | null;
  customerName: string;
  customerEmail: string;
};

export type CheckoutState = {
  cardSummary: CardSummary | null;
  step: CheckoutStep;
  customerName: string;
  customerEmail: string;
  paymentError: string | null;
  paymentResult: Transaction | null;
  paymentStatus: PaymentStatus;
  restored: boolean;
};

export const initialCheckoutState: CheckoutState = {
  cardSummary: null,
  step: 'cart',
  customerName: '',
  customerEmail: '',
  paymentError: null,
  paymentResult: null,
  paymentStatus: 'idle',
  restored: false,
};

const checkoutStorageKey = 'checkout';

export const loadCheckout = createAsyncThunk('checkout/load', async () => {
  return secureStorage.getJson<CheckoutDraft>(checkoutStorageKey);
});

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
      return { ...initialCheckoutState, restored: true };
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadCheckout.fulfilled, (state, action) => {
        state.cardSummary = action.payload?.cardSummary ?? null;
        state.customerEmail = action.payload?.customerEmail ?? '';
        state.customerName = action.payload?.customerName ?? '';
        state.restored = true;
      })
      .addCase(loadCheckout.rejected, state => {
        state.restored = true;
      });
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

export const checkoutStorage = {
  key: checkoutStorageKey,
  async persist(state: CheckoutState) {
    const draft: CheckoutDraft = {
      cardSummary: state.cardSummary,
      customerEmail: state.customerEmail,
      customerName: state.customerName,
    };

    if (!draft.cardSummary && !draft.customerEmail && !draft.customerName) {
      await secureStorage.remove(checkoutStorageKey);
      return;
    }

    await secureStorage.setJson(checkoutStorageKey, draft);
  },
};

export default checkoutSlice.reducer;
