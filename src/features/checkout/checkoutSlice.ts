import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type CheckoutStep = 'cart' | 'card' | 'summary' | 'processing' | 'result';

export type CheckoutState = {
  step: CheckoutStep;
  customerName: string;
  customerEmail: string;
};

export const initialCheckoutState: CheckoutState = {
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
    resetCheckout() {
      return initialCheckoutState;
    },
  },
});

export const { resetCheckout, setCheckoutStep, setCustomer } =
  checkoutSlice.actions;
export default checkoutSlice.reducer;
