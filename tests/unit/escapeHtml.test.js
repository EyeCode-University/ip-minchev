import { describe, it, expect } from 'vitest';
import { escapeHtml } from '@/lib/sendEmail';

describe('escapeHtml', () => {
  it('экранирует все опасные символы', () => {
    expect(escapeHtml('<script>alert("x")</script>')).toBe(
      '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;'
    );
  });

  it('экранирует амперсанд первым (без двойного экранирования)', () => {
    expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
    expect(escapeHtml('<')).toBe('&lt;');
  });

  it('не трогает безопасный текст', () => {
    expect(escapeHtml('Иванов Иван')).toBe('Иванов Иван');
  });

  it('приводит не-строки к строке', () => {
    expect(escapeHtml(123)).toBe('123');
    expect(escapeHtml(null)).toBe('null');
  });
});
