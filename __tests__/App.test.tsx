/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
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
