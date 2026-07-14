import { ApiError, apiRequest } from '../src/shared/api/client';
import { paymentsApi } from '../src/shared/api/paymentsApi';
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

  it('exposes payment flow endpoints', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'transaction-1' }),
    });

    await paymentsApi.createTransaction({
      customerEmail: 'luis@example.com',
      customerName: 'Luis Munar',
      items: [{ productId: 'product-1', quantity: 2 }],
    });
    await paymentsApi.processCardPayment('transaction-1', {
      card: {
        cardHolder: 'Luis Munar',
        cvc: '123',
        expMonth: '12',
        expYear: '30',
        number: '4242424242424242',
      },
      installments: 1,
    });
    await paymentsApi.getTransaction('transaction-1');

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'http://10.0.2.2:3000/transactions',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'http://10.0.2.2:3000/transactions/transaction-1/payments/card',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      'http://10.0.2.2:3000/transactions/transaction-1',
      expect.objectContaining({ method: 'GET' }),
    );
  });
});
