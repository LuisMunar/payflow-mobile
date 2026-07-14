import type {
  CardPaymentRequest,
  CreateTransactionRequest,
  Transaction,
} from '../types/api';
import { apiRequest } from './client';

export const paymentsApi = {
  createTransaction: (request: CreateTransactionRequest) =>
    apiRequest<Transaction>('/transactions', {
      method: 'POST',
      body: request,
    }),
  processCardPayment: (transactionId: string, request: CardPaymentRequest) =>
    apiRequest<Transaction>(`/transactions/${transactionId}/payments/card`, {
      method: 'POST',
      body: request,
    }),
  getTransaction: (transactionId: string) =>
    apiRequest<Transaction>(`/transactions/${transactionId}`),
};
