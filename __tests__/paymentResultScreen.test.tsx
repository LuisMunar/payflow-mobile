import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { PaymentResultScreen } from '../src/features/checkout/PaymentResultScreen';
import { resetCheckout, setCheckoutStep } from '../src/features/checkout/checkoutSlice';
import type { RootState } from '../src/app/store';

const mockDispatch = jest.fn();
const navigation = {
  navigate: jest.fn(),
  popToTop: jest.fn(),
};
let mockState: Pick<RootState, 'checkout'>;

jest.mock('../src/app/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: RootState) => unknown) =>
    selector(mockState as RootState),
}));

function render(element: React.ReactElement) {
  let tree!: ReactTestRenderer.ReactTestRenderer;

  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(element);
  });

  return tree;
}

describe('PaymentResultScreen', () => {
  beforeEach(() => {
    mockDispatch.mockReset();
    navigation.navigate.mockReset();
    navigation.popToTop.mockReset();
    mockState = {
      checkout: {
        cardSummary: {
          brand: 'visa',
          cardHolder: 'Luis Munar',
          lastFour: '4242',
        },
        customerEmail: 'luis@example.com',
        customerName: 'Luis Munar',
        paymentError: null,
        paymentResult: {
          amountInCents: 120000,
          cardBrand: 'VISA',
          cardLastFour: '4242',
          currency: 'COP',
          customerEmail: 'luis@example.com',
          customerName: 'Luis Munar',
          gatewayStatus: 'APPROVED',
          items: [],
          reference: 'PAY-1',
          status: 'APPROVED',
        },
        paymentStatus: 'succeeded',
        step: 'result',
      },
    };
  });

  it('renders approved payment results and continues shopping', () => {
    const tree = render(
      <PaymentResultScreen navigation={navigation as never} route={{} as never} />,
    );

    expect(tree.root.findByProps({ children: 'Payment approved' })).toBeTruthy();
    expect(tree.root.findByProps({ children: 'PAY-1' })).toBeTruthy();

    ReactTestRenderer.act(() => {
      tree.root
        .findByProps({ accessibilityLabel: 'Continue shopping' })
        .props.onPress();
    });

    expect(mockDispatch).toHaveBeenCalledWith(resetCheckout());
    expect(navigation.popToTop).toHaveBeenCalledTimes(1);
    expect(navigation.navigate).not.toHaveBeenCalled();
  });

  it('renders rejected payment results', () => {
    mockState.checkout.paymentResult = {
      ...mockState.checkout.paymentResult!,
      gatewayStatus: 'DECLINED',
      status: 'DECLINED',
    };
    const tree = render(
      <PaymentResultScreen navigation={navigation as never} route={{} as never} />,
    );

    expect(tree.root.findByProps({ children: 'Payment rejected' })).toBeTruthy();
    expect(
      tree.root.findByProps({
        children: 'The payment was rejected by the gateway.',
      }),
    ).toBeTruthy();
    expect(tree.root.findByProps({ accessibilityLabel: 'Retry payment' }))
      .toBeTruthy();
  });

  it('renders payment errors and allows retrying checkout', () => {
    mockState.checkout.paymentError = 'Payment could not be processed.';
    mockState.checkout.paymentResult = null;
    mockState.checkout.paymentStatus = 'failed';
    const tree = render(
      <PaymentResultScreen navigation={navigation as never} route={{} as never} />,
    );

    expect(tree.root.findByProps({ children: 'Payment error' })).toBeTruthy();
    expect(tree.root.findByProps({ children: 'Payment could not be processed.' }))
      .toBeTruthy();

    ReactTestRenderer.act(() => {
      tree.root.findByProps({ accessibilityLabel: 'Retry payment' }).props.onPress();
    });

    expect(mockDispatch).toHaveBeenCalledWith(setCheckoutStep('card'));
    expect(navigation.navigate).toHaveBeenCalledWith('Checkout');
  });

  it('renders default error copy without a stored error message', () => {
    mockState.checkout.paymentError = null;
    mockState.checkout.paymentResult = null;
    mockState.checkout.paymentStatus = 'failed';
    const tree = render(
      <PaymentResultScreen navigation={navigation as never} route={{} as never} />,
    );

    expect(tree.root.findByProps({ children: 'Payment error' })).toBeTruthy();
    expect(tree.root.findByProps({ children: 'The payment could not be completed.' }))
      .toBeTruthy();
    expect(tree.root.findByProps({ children: 'Error' })).toBeTruthy();
  });

  it('renders result summaries without optional gateway metadata', () => {
    mockState.checkout.paymentResult = {
      amountInCents: 120000,
      currency: 'COP',
      customerEmail: 'luis@example.com',
      customerName: 'Luis Munar',
      items: [],
      reference: 'PAY-2',
      status: 'ERROR',
    };
    const tree = render(
      <PaymentResultScreen navigation={navigation as never} route={{} as never} />,
    );

    expect(tree.root.findByProps({ children: 'PAY-2' })).toBeTruthy();
    expect(tree.root.findByProps({ children: 'Payment error' })).toBeTruthy();
  });
});
