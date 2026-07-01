import { describe, it, expect, beforeEach, vi } from 'vitest';

const { sendEmailMock, sendTelegramMock, headersMock } = vi.hoisted(() => ({
  sendEmailMock: vi.fn(),
  sendTelegramMock: vi.fn(),
  headersMock: vi.fn(),
}));

vi.mock('@/lib/sendEmail', () => ({ sendEmail: sendEmailMock }));
vi.mock('@/lib/sendTelegram', () => ({ sendTelegram: sendTelegramMock }));
vi.mock('next/headers', () => ({ headers: headersMock }));

import { submitApplication } from '@/app/actions';

// Заголовки по умолчанию — собираем Map-подобный объект с .get().
function stubHeaders(map = {}) {
  headersMock.mockResolvedValue({
    get: (k) => map[k.toLowerCase()] ?? null,
  });
}

// Конструктор валидной формы; перекрываем нужные поля через overrides.
function buildForm(overrides = {}) {
  const fd = new FormData();
  const defaults = {
    name: 'ООО Ромашка',
    contact: '+7 900 000-00-00',
    message: 'Нужен гидроцилиндр Ø200',
    consent: 'on',
  };
  const merged = { ...defaults, ...overrides };
  for (const [k, v] of Object.entries(merged)) {
    if (v !== undefined && v !== null) fd.set(k, v);
  }
  if (overrides.file !== null) {
    fd.set('file', overrides.file ?? new File(['data'], 'draft.pdf', { type: 'application/pdf' }));
  }
  return fd;
}

beforeEach(() => {
  sendEmailMock.mockReset().mockResolvedValue(undefined);
  sendTelegramMock.mockReset().mockResolvedValue(undefined);
  stubHeaders({ 'x-forwarded-for': '203.0.113.5, 10.0.0.1', 'user-agent': 'Mozilla/5.0' });
});

describe('submitApplication — валидация', () => {
  it('ошибка, если не заполнены обязательные поля', async () => {
    const res = await submitApplication(null, buildForm({ name: '' }));
    expect(res).toEqual({ success: false, error: 'Заполните все обязательные поля.' });
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it('обрезает пробелы — строка из пробелов считается пустой', async () => {
    const res = await submitApplication(null, buildForm({ message: '   ' }));
    expect(res.success).toBe(false);
  });

  it('ошибка без согласия', async () => {
    const res = await submitApplication(null, buildForm({ consent: 'off' }));
    expect(res.error).toMatch(/согласие/i);
  });

  it('ошибка, если файл не прикреплён', async () => {
    const res = await submitApplication(null, buildForm({ file: null }));
    expect(res.error).toMatch(/[Пп]рикрепите файл/);
  });

  it('ошибка при пустом файле (size === 0)', async () => {
    const res = await submitApplication(null, buildForm({ file: new File([], 'empty.pdf') }));
    expect(res.error).toMatch(/[Пп]рикрепите файл/);
  });

  it('ошибка при недопустимом расширении', async () => {
    const res = await submitApplication(null, buildForm({ file: new File(['x'], 'virus.exe') }));
    expect(res.error).toMatch(/форматы/i);
  });

  it.each(['draft.pdf', 'photo.JPG', 'scan.png', 'model.dwg'])(
    'принимает разрешённое расширение %s',
    async (fname) => {
      const res = await submitApplication(null, buildForm({ file: new File(['x'], fname) }));
      expect(res.success).toBe(true);
    }
  );

  it('ошибка при превышении 10 МБ', async () => {
    const big = new File(['x'], 'big.pdf');
    Object.defineProperty(big, 'size', { value: 10 * 1024 * 1024 + 1 });
    const res = await submitApplication(null, buildForm({ file: big }));
    expect(res.error).toMatch(/10 МБ/);
  });
});

describe('submitApplication — успешная отправка', () => {
  it('вызывает sendEmail и sendTelegram и возвращает success', async () => {
    const res = await submitApplication(null, buildForm());

    expect(res).toEqual({ success: true });
    expect(sendEmailMock).toHaveBeenCalledOnce();
    expect(sendTelegramMock).toHaveBeenCalledOnce();
  });

  it('передаёт данные заявки и буфер файла в sendEmail', async () => {
    await submitApplication(null, buildForm());
    const arg = sendEmailMock.mock.calls[0][0];

    expect(arg.name).toBe('ООО Ромашка');
    expect(arg.contact).toBe('+7 900 000-00-00');
    expect(Buffer.isBuffer(arg.file.buffer)).toBe(true);
    expect(arg.file.name).toBe('draft.pdf');
  });

  it('берёт первый IP из x-forwarded-for', async () => {
    await submitApplication(null, buildForm());
    const meta = sendEmailMock.mock.calls[0][0].consentMeta;
    expect(meta.ip).toBe('203.0.113.5');
    expect(meta.version).toBe('v1.0');
    expect(meta.userAgent).toBe('Mozilla/5.0');
  });

  it('падает на x-real-ip, затем на «неизвестно»', async () => {
    stubHeaders({ 'x-real-ip': '198.51.100.7' });
    await submitApplication(null, buildForm());
    expect(sendEmailMock.mock.calls[0][0].consentMeta.ip).toBe('198.51.100.7');

    stubHeaders({});
    await submitApplication(null, buildForm());
    expect(sendEmailMock.mock.calls[1][0].consentMeta.ip).toBe('неизвестно');
  });
});

describe('submitApplication — обработка ошибок', () => {
  it('ловит исключение из отправки и возвращает дружелюбную ошибку', async () => {
    sendEmailMock.mockRejectedValueOnce(new Error('SMTP down'));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const res = await submitApplication(null, buildForm());
    expect(res).toEqual({ success: false, error: 'Ошибка при отправке заявки. Попробуйте позже.' });
  });
});
