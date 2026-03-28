const currencyConfig: Record<string, { symbol: string; position: 'before' | 'after' }> = {
  USD: { symbol: '$', position: 'before' },
  EUR: { symbol: '€', position: 'before' },
  GBP: { symbol: '£', position: 'before' },
  EGP: { symbol: 'ج.م', position: 'after' },
  SAR: { symbol: 'ر.س', position: 'after' },
  AED: { symbol: 'د.إ', position: 'after' },
  KWD: { symbol: 'د.ك', position: 'after' },
  QAR: { symbol: 'ر.ق', position: 'after' },
  BHD: { symbol: 'د.ب', position: 'after' },
  OMR: { symbol: 'ر.ع', position: 'after' },
  JOD: { symbol: 'د.أ', position: 'after' },
  IQD: { symbol: 'د.ع', position: 'after' },
};

export const formatPrice = (price: number, currency: string = 'USD') => {
  const config = currencyConfig[currency] || { symbol: currency, position: 'before' };
  const formatted = price.toFixed(2);
  return config.position === 'before'
    ? `${config.symbol}${formatted}`
    : `${formatted} ${config.symbol}`;
};

export const currencyOptions = Object.keys(currencyConfig);
