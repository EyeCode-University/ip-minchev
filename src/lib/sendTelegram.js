export async function sendTelegram({ name, contact, message, fileName, consentMeta }) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) return;

  const lines = [
    '*Новая заявка с сайта №00278*',
    '',
    `*Имя / Компания:* ${escapeMarkdown(name)}`,
    `*Контакт:* ${escapeMarkdown(contact)}`,
    `*Сообщение:* ${escapeMarkdown(message)}`,
    `*Файл:* ${escapeMarkdown(fileName)}`,
  ];

  if (consentMeta) {
    lines.push(
      '',
      '🔒 *Согласие на обработку ПДн*',
      `*Версия:* ${escapeMarkdown(consentMeta.version)}`,
      `*Дата и время:* ${escapeMarkdown(consentMeta.timestamp)}`,
      `*IP:* ${escapeMarkdown(consentMeta.ip)}`,
      `*User-Agent:* ${escapeMarkdown(consentMeta.userAgent)}`,
    );
  }

  lines.push('', '_Подробности и файл отправлены на email._');

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: lines.join('\n'),
      parse_mode: 'Markdown',
    }),
  });
}

function escapeMarkdown(str) {
  return String(str).replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1');
}
