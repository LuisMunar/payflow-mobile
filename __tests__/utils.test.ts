import { formatMoney } from '../src/shared/utils/formatMoney';

describe('formatMoney', () => {
  it('formats cent amounts in Colombian pesos', () => {
    expect(formatMoney(199900, 'COP')).toMatch(/1\.999/);
  });
});
