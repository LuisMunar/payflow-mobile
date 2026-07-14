import { ApiError, apiRequest } from '../src/shared/api/client';
import { productsApi } from '../src/shared/api/productsApi';

describe('api client', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    globalThis.fetch = fetchMock;
  });

  it('sends json requests to the configured backend', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: true }),
    });

    await expect(
      apiRequest('/transactions', {
        method: 'POST',
        body: { items: [] },
      }),
    ).resolves.toEqual({ ok: true });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://10.0.2.2:3000/transactions',
      expect.objectContaining({
        body: JSON.stringify({ items: [] }),
        method: 'POST',
      }),
    );
  });

  it('throws normalized api errors', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
    });

    await expect(apiRequest('/products')).rejects.toEqual(
      new ApiError('The backend returned an unexpected response.', 500),
    );
  });

  it('exposes product endpoints', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    await productsApi.list();
    await productsApi.getById('product-1');

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'http://10.0.2.2:3000/products',
      expect.any(Object),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'http://10.0.2.2:3000/products/product-1',
      expect.any(Object),
    );
  });
});
