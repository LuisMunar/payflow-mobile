import * as Keychain from 'react-native-keychain';

const servicePrefix = 'payflow-mobile';

export const secureStorage = {
  async getJson<T>(key: string): Promise<T | null> {
    const credentials = await Keychain.getGenericPassword({
      service: `${servicePrefix}.${key}`,
    });

    if (!credentials) {
      return null;
    }

    return JSON.parse(credentials.password) as T;
  },
  async remove(key: string): Promise<void> {
    await Keychain.resetGenericPassword({ service: `${servicePrefix}.${key}` });
  },
  async setJson<T>(key: string, value: T): Promise<void> {
    await Keychain.setGenericPassword(key, JSON.stringify(value), {
      service: `${servicePrefix}.${key}`,
    });
  },
};
