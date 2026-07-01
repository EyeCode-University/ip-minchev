import { describe, it, expect } from 'vitest';
import { escapeMarkdown } from '@/lib/sendTelegram';

describe('escapeMarkdown', () => {
  it('экранирует спецсимволы Markdown обратным слэшем', () => {
    expect(escapeMarkdown('a_b*c')).toBe('a\\_b\\*c');
    expect(escapeMarkdown('[link](url)')).toBe('\\[link\\]\\(url\\)');
  });

  it('экранирует точку, дефис и восклицательный знак', () => {
    expect(escapeMarkdown('1.0-beta!')).toBe('1\\.0\\-beta\\!');
  });

  it('не трогает обычные буквы и пробелы', () => {
    expect(escapeMarkdown('ООО Ромашка')).toBe('ООО Ромашка');
  });

  it('приводит не-строки к строке', () => {
    expect(escapeMarkdown(42)).toBe('42');
  });
});
