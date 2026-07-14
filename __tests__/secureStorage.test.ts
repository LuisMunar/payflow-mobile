import * as Keychain from 'react-native-keychain';

import { secureStorage } from '../src/shared/storage/secureStorage';

jest.mock('react-native-keychain', () => ({
  getGenericPassword: jest.fn(),
  resetGenericPassword: jest.fn(),
  setGenericPassword: jest.fn(),
}));

describe('secureStorage', () => {
  beforeEach(() => {
    jest.mocked(Keychain.getGenericPassword).mockReset();
    jest.mocked(Keychain.resetGenericPassword).mockReset();
    jest.mocked(Keychain.setGenericPassword).mockReset();
  });

  it('returns null when no credentials are stored', async () => {
    jest.mocked(Keychain.getGenericPassword).mockResolvedValue(false);

    await expect(secureStorage.getJson('cart')).resolves.toBeNull();
    expect(Keychain.getGenericPassword).toHaveBeenCalledWith({
      service: 'payflow-mobile.cart',
    });
  });

  it('reads and writes json values by service key', async () => {
    jest.mocked(Keychain.getGenericPassword).mockResolvedValue({
      password: '{"ok":true}',
      username: 'cart',
    } as never);

    await expect(secureStorage.getJson<{ ok: boolean }>('cart')).resolves.toEqual({
      ok: true,
    });
    await secureStorage.setJson('cart', [{ id: 'product-1' }]);
    await secureStorage.remove('cart');

    expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
      'cart',
      JSON.stringify([{ id: 'product-1' }]),
      { service: 'payflow-mobile.cart' },
    );
    expect(Keychain.resetGenericPassword).toHaveBeenCalledWith({
      service: 'payflow-mobile.cart',
    });
  });
});
