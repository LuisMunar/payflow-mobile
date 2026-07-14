/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import * as ReactNative from 'react-native';
import App from '../App';

jest.mock('react-native-keychain', () => ({
  getGenericPassword: jest.fn(),
  resetGenericPassword: jest.fn(),
  setGenericPassword: jest.fn(),
}));

test('renders correctly', () => {
  jest.useFakeTimers();
  let tree!: ReactTestRenderer.ReactTestRenderer;

  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<App />);
  });

  ReactTestRenderer.act(() => {
    tree.unmount();
    jest.runOnlyPendingTimers();
  });

  jest.useRealTimers();
});

test('renders dark status bar style in dark mode', () => {
  jest.spyOn(ReactNative, 'useColorScheme').mockReturnValue('dark');
  jest.useFakeTimers();
  let tree!: ReactTestRenderer.ReactTestRenderer;

  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<App />);
  });

  expect(tree.root.findByType(ReactNative.StatusBar).props.barStyle).toBe(
    'light-content',
  );

  ReactTestRenderer.act(() => {
    tree.unmount();
    jest.runOnlyPendingTimers();
  });

  jest.useRealTimers();
  jest.restoreAllMocks();
});
