export type Product = {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  currency: string;
  stock: number;
  available: boolean;
  imageUrl: string;
};

export type CreateTransactionRequest = {
  customerName: string;
  customerEmail: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
};

export type CardPaymentRequest = {
  card: {
    number: string;
    expMonth: string;
    expYear: string;
    cvc: string;
    cardHolder: string;
  };
  installments: number;
};

export type Transaction = {
  id?: string;
  reference: string;
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR' | string;
  amountInCents: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  cardBrand?: string | null;
  cardLastFour?: string | null;
  gatewayTransactionId?: string | null;
  gatewayStatus?: string | null;
  items: Array<{
    id?: string;
    productId: string;
    quantity: number;
    unitPriceInCents: number;
    totalInCents: number;
  }>;
};
