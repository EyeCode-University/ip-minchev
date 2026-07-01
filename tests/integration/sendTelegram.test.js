import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { sendTelegram } from '@/lib/sendTelegram';

const baseArgs = {
  name: 'ООО Ромашка',
  contact: '+7 900 000-00-00',
  message: 'Нужен гидроцилиндр',
  fileName: 'draft.pdf',
};

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
  process.env.TELEGRAM_BOT_TOKEN = 'TOKEN123';
  process.env.TELEGRAM_CHAT_ID = '555';
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('sendTelegram', () => {
  it('шлёт POST на правильный URL с chat_id и Markdown', async () => {
    await sendTelegram(baseArgs);

    expect(fetch).toHaveBeenCalledOnce();
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe('https://api.telegram.org/botTOKEN123/sendMessage');
    expect(init.method).toBe('POST');

    const body = JSON.parse(init.body);
    expect(body.chat_id).toBe('555');
    expect(body.parse_mode).toBe('Markdown');
    expect(body.text).toContain('Новая заявка с сайта');
    expect(body.text).toContain('ООО Ромашка');
  });

  it('экранирует спецсимволы Markdown в полях', async () => {
    await sendTelegram({ ...baseArgs, message: 'цена_1*2' });
    const body = JSON.parse(fetch.mock.calls[0][1].body);
    expect(body.text).toContain('цена\\_1\\*2');
  });

  it('добавляет блок согласия в сообщение', async () => {
    await sendTelegram({
      ...baseArgs,
      consentMeta: { version: 'v1.0', timestamp: '2026-06-23', ip: '1.2.3.4', userAgent: 'UA' },
    });
    const body = JSON.parse(fetch.mock.calls[0][1].body);
    expect(body.text).toContain('Согласие на обработку ПДн');
    expect(body.text).toContain('1\\.2\\.3\\.4');
  });

  it('ничего не делает без токена или chat_id', async () => {
    delete process.env.TELEGRAM_BOT_TOKEN;
    await sendTelegram(baseArgs);
    expect(fetch).not.toHaveBeenCalled();
  });
});
