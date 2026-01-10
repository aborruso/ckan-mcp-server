import { describe, it, expect } from 'vitest';
import { truncateText, formatDate, formatBytes } from '../../src/utils/formatting';

describe('truncateText', () => {
  it('returns text unchanged when under limit', () => {
    const text = 'Short text';
    const result = truncateText(text, 100);
    expect(result).toBe(text);
  });

  it('returns text unchanged when exactly at limit', () => {
    const text = 'a'.repeat(100);
    const result = truncateText(text, 100);
    expect(result).toBe(text);
  });

  it('truncates text when over limit', () => {
    const text = 'a'.repeat(105);
    const result = truncateText(text, 100);
    expect(result.length).toBeGreaterThan(100);
    expect(result).toContain('... [Response truncated at 100 characters]');
  });

  it('uses default limit when not specified', () => {
    const text = 'a'.repeat(50001);
    const result = truncateText(text);
    expect(result).toContain('... [Response truncated at 50000 characters]');
  });

  it('handles empty string', () => {
    const result = truncateText('');
    expect(result).toBe('');
  });
});

describe('formatDate', () => {
  it('formats ISO date string correctly', () => {
    const result = formatDate('2024-01-15T10:30:00Z');
    expect(result).toBe('2024-01-15');
  });

  it('handles different ISO date formats', () => {
    const result1 = formatDate('2024-12-25T23:59:59Z');
    expect(result1).toBeDefined();

    const result2 = formatDate('2024-06-30T00:00:00Z');
    expect(result2).toBeDefined();
  });

  it('formats invalid date as "Invalid Date"', () => {
    const invalidDate = 'invalid-date';
    const result = formatDate(invalidDate);
    expect(result).toBe('Invalid Date');
  });

  it('handles null/undefined gracefully', () => {
    const result1 = formatDate(null as any);
    expect(result1).toBeDefined();

    const result2 = formatDate(undefined as any);
    expect(result2).toBeDefined();
  });
});

describe('formatBytes', () => {
  it('returns 0 B for zero bytes', () => {
    const result = formatBytes(0);
    expect(result).toBe('0 B');
  });

  it('returns 0 B for undefined bytes', () => {
    const result = formatBytes(undefined);
    expect(result).toBe('0 B');
  });

  it('formats bytes correctly', () => {
    const result = formatBytes(500);
    expect(result).toBe('500 B');
  });

  it('formats kilobytes correctly', () => {
    const result = formatBytes(1500);
    expect(result).toBe('1.46 KB');
  });

  it('formats megabytes correctly', () => {
    const result = formatBytes(1500000);
    expect(result).toBe('1.43 MB');
  });

  it('formats gigabytes correctly', () => {
    const result = formatBytes(1500000000);
    expect(result).toBe('1.4 GB');
  });

  it('formats exact kilobyte boundary', () => {
    const result = formatBytes(1024);
    expect(result).toBe('1 KB');
  });

  it('formats exact megabyte boundary', () => {
    const result = formatBytes(1048576);
    expect(result).toBe('1 MB');
  });

  it('formats exact gigabyte boundary', () => {
    const result = formatBytes(1073741824);
    expect(result).toBe('1 GB');
  });

  it('handles large numbers', () => {
    const result = formatBytes(1500000000);
    expect(result).toContain('GB');
  });
});
