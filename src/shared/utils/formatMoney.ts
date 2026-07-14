export function formatMoney(amountInCents: number, currency: string) {
  return new Intl.NumberFormat('es-CO', {
    currency,
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(amountInCents / 100);
}
