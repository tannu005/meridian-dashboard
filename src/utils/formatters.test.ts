import { describe, it, expect } from 'vitest';
import { formatCurrency, formatPercentage, formatLargeNumber } from './formatters';

describe('Financial Formatters', () => {
  describe('formatCurrency', () => {
    it('formats positive numbers as USD currency', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
    });

    it('formats negative numbers correctly', () => {
      expect(formatCurrency(-500)).toBe('-$500.00');
    });

    it('handles zero', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });
  });

  describe('formatPercentage', () => {
    it('formats decimals into percentages with 2 decimal places by default', () => {
      expect(formatPercentage(5.678)).toBe('5.68%');
    });

    it('handles custom decimal places', () => {
      expect(formatPercentage(10.5, 0)).toBe('11%');
    });
  });

  describe('formatLargeNumber', () => {
    it('formats billions with B suffix', () => {
      expect(formatLargeNumber(45000000000)).toBe('45.00B');
    });

    it('formats millions with M suffix', () => {
      expect(formatLargeNumber(2500000)).toBe('2.50M');
    });

    it('formats thousands with K suffix', () => {
      expect(formatLargeNumber(1500)).toBe('1.50K');
    });

    it('leaves small numbers alone', () => {
      expect(formatLargeNumber(42)).toBe('42');
    });
  });
});
