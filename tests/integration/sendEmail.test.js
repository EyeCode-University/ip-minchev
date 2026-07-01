import { describe, it, expect, beforeEach, vi } from 'vitest';

// Мокаем nodemailer до импорта модуля: transporter создаётся на этапе загрузки.
const { sendMailMock } = vi.hoisted(() => ({ sendMailMock: vi.fn() }));

vi.mock('nodemailer', () => ({
  default: {
    createTransport: () => ({ sendMail: sendMailMock }),
  },
}));

import { sendEmail } from '@/lib/sendEmail';

const baseArgs = {
  name: 'ООО Ромашка',
  contact: '+7 900 000-00-00',
  message: 'Нужен гидроцилиндр',
  file: { name: 'draft.pdf', buffer: Buffer.from('PDF') },
};

beforeEach(() => {
  sendMailMock.mockReset();
  process.env.SMTP_USER = 'noreply@example.ru';
  process.env.EMAIL_TO = 'sales@example.ru';
});

describe('sendEmail', () => {
  it('передаёт корректные mailOptions и вложение', async () => {
    await sendEmail(baseArgs);

    expect(sendMailMock).toHaveBeenCalledOnce();
    const opts = sendMailMock.mock.calls[0][0];

    expect(opts.to).toBe('sales@example.ru');
    expect(opts.from).toContain('noreply@example.ru');
    expect(opts.subject).toBe('Новая заявка от ООО Ромашка');
    expect(opts.attachments).toEqual([
      { filename: 'draft.pdf', content: baseArgs.file.buffer },
    ]);
  });

  it('экранирует HTML в пользовательских полях (защита от инъекций)', async () => {
    await sendEmail({ ...baseArgs, name: '<b>x</b>', message: 'a & b' });

    const { html } = sendMailMock.mock.calls[0][0];
    expect(html).toContain('&lt;b&gt;x&lt;/b&gt;');
    expect(html).toContain('a &amp; b');
    expect(html).not.toContain('<b>x</b>');
  });

  it('добавляет блок согласия, когда передан consentMeta', async () => {
    await sendEmail({
      ...baseArgs,
      consentMeta: {
        version: 'v1.0',
        timestamp: '2026-06-23T10:00:00.000Z',
        ip: '1.2.3.4',
        userAgent: 'UA',
      },
    });

    const { html } = sendMailMock.mock.calls[0][0];
    expect(html).toContain('Согласие на обработку персональных данных');
    expect(html).toContain('1.2.3.4');
    expect(html).toContain('v1.0');
  });

  it('не добавляет блок согласия без consentMeta', async () => {
    await sendEmail(baseArgs);
    const { html } = sendMailMock.mock.calls[0][0];
    expect(html).not.toContain('Согласие на обработку персональных данных');
  });
});
