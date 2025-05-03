import { describe, it, expect } from 'vitest';
import { formatDate, truncateText, formatPrice, getNestedValue } from '../utils';

describe('Utility Functions', () => {
  describe('formatDate', () => {
    it('formats date in English locale by default', () => {
      const date = new Date('2023-05-15');
      const formatted = formatDate(date);
      expect(formatted).toMatch(/May 15, 2023/);
    });

    it('respects locale parameter', () => {
      const date = new Date('2023-05-15');
      const formatted = formatDate(date, 'pl-PL');
      // Polish format has day before month
      expect(formatted).toMatch(/15/);
      expect(formatted).toMatch(/2023/);
    });
  });

  describe('truncateText', () => {
    it('does not truncate strings shorter than maxLength', () => {
      const text = 'Hello world';
      expect(truncateText(text, 20)).toBe(text);
    });

    it('truncates strings longer than maxLength and adds ellipsis', () => {
      const text = 'This is a very long text that needs to be truncated';
      const truncated = truncateText(text, 10);
      expect(truncated).toBe('This is...');
      expect(truncated.length).toBe(10);
    });

    it('handles empty strings', () => {
      expect(truncateText('', 10)).toBe('');
    });
  });

  describe('formatPrice', () => {
    it('formats price with USD by default', () => {
      const formatted = formatPrice(1234.56);
      expect(formatted).toMatch(/\$1,234\.56/);
    });

    it('respects currency parameter', () => {
      const formatted = formatPrice(1234.56, 'EUR');
      expect(formatted).toMatch(/€|EUR/);
    });

    it('handles zero values', () => {
      const formatted = formatPrice(0);
      expect(formatted).toMatch(/\$0/);
    });
  });

  describe('getNestedValue', () => {
    const testObject = {
      user: {
        profile: {
          name: 'John Doe',
          address: {
            city: 'New York',
            zip: '10001'
          }
        },
        settings: {
          theme: 'dark'
        }
      },
      data: null
    };

    it('retrieves nested values when they exist', () => {
      expect(getNestedValue(testObject, 'user.profile.name', '')).toBe('John Doe');
      expect(getNestedValue(testObject, 'user.profile.address.city', '')).toBe('New York');
      expect(getNestedValue(testObject, 'user.settings.theme', '')).toBe('dark');
    });

    it('returns default value when path does not exist', () => {
      expect(getNestedValue(testObject, 'user.profile.age', 30)).toBe(30);
      expect(getNestedValue(testObject, 'app.version', '1.0.0')).toBe('1.0.0');
    });

    it('returns default value when encountering null/undefined in path', () => {
      expect(getNestedValue(testObject, 'data.id', 'default')).toBe('default');
    });
  });
});