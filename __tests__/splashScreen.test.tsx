import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { SplashScreen } from '../src/features/splash/SplashScreen';

describe('SplashScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows branding and navigates to products', () => {
    const navigation = { replace: jest.fn() };
    let tree!: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <SplashScreen navigation={navigation as never} route={{} as never} />,
      );
    });

    expect(tree.root.findByProps({ children: 'Payflow' })).toBeTruthy();

    ReactTestRenderer.act(() => {
      jest.advanceTimersByTime(900);
    });

    expect(navigation.replace).toHaveBeenCalledWith('Products');
  });
});
