'use server';

import { headers } from 'next/headers';
import { sendEmail } from '@/lib/sendEmail';
import { sendTelegram } from '@/lib/sendTelegram';
import { CONSENT_VERSION } from '@/lib/privacy';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const VALID_EXTENSIONS = ['jpg', 'jpeg', 'png', 'pdf', 'dwg'];

export async function submitApplication(prevState, formData) {
  const name = formData.get('name')?.toString().trim();
  const contact = formData.get('contact')?.toString().trim();
  const message = formData.get('message')?.toString().trim();
  const consent = formData.get('consent')?.toString();
  const file = formData.get('file');

  if (!name || !contact || !message) {
    return { success: false, error: 'Заполните все обязательные поля.' };
  }

  if (consent !== 'on') {
    return {
      success: false,
      error: 'Необходимо согласие на обработку персональных данных.',
    };
  }

  if (!file || !(file instanceof File) || file.size === 0) {
    return { success: false, error: 'Прикрепите файл (jpg, png, pdf или dwg).' };
  }

  const ext = file.name.split('.').pop().toLowerCase();
  if (!VALID_EXTENSIONS.includes(ext)) {
    return { success: false, error: 'Допустимые форматы файлов: jpg, png, pdf, dwg.' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: 'Максимальный размер файла — 10 МБ.' };
  }

  const h = await headers();
  const consentMeta = {
    version: CONSENT_VERSION,
    timestamp: new Date().toISOString(),
    ip: h.get('x-forwarded-for')?.split(',')[0].trim() || h.get('x-real-ip') || 'неизвестно',
    userAgent: h.get('user-agent') || 'неизвестно',
  };

  try {
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    await Promise.all([
      sendEmail({
        name,
        contact,
        message,
        file: { buffer: fileBuffer, name: file.name },
        consentMeta,
      }),
      sendTelegram({
        name,
        contact,
        message,
        fileName: file.name,
        consentMeta,
      }),
    ]);

    return { success: true };
  } catch (err) {
    console.error('submitApplication error:', err);
    return { success: false, error: 'Ошибка при отправке заявки. Попробуйте позже.' };
  }
}
