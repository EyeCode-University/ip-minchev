import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.yandex.ru',
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendEmail({ name, contact, message, file, consentMeta }) {
  const consentBlock = consentMeta
    ? `
      <h3 style="margin-top:24px;font-family:sans-serif;font-size:14px;color:#333;">
        Согласие на обработку персональных данных
      </h3>
      <table style="border-collapse:collapse;font-family:sans-serif;font-size:13px;color:#555;">
        <tr><td style="padding:4px 8px;">Версия:</td><td style="padding:4px 8px;">${escapeHtml(consentMeta.version)}</td></tr>
        <tr><td style="padding:4px 8px;">Дата и время:</td><td style="padding:4px 8px;">${escapeHtml(consentMeta.timestamp)}</td></tr>
        <tr><td style="padding:4px 8px;">IP-адрес:</td><td style="padding:4px 8px;">${escapeHtml(consentMeta.ip)}</td></tr>
        <tr><td style="padding:4px 8px;">User-Agent:</td><td style="padding:4px 8px;word-break:break-all;">${escapeHtml(consentMeta.userAgent)}</td></tr>
      </table>
    `
    : '';

  const mailOptions = {
    from: `"Заявка с сайта" <${process.env.SMTP_USER}>`,
    to: process.env.EMAIL_TO,
    subject: `Новая заявка от ${name}`,
    html: `
      <h2>Новая заявка с сайта</h2>
      <table style="border-collapse:collapse;font-family:sans-serif;">
        <tr><td style="padding:8px;font-weight:bold;">Имя / Компания:</td><td style="padding:8px;">${escapeHtml(name)}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;">Контакт:</td><td style="padding:8px;">${escapeHtml(contact)}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;">Сообщение:</td><td style="padding:8px;">${escapeHtml(message)}</td></tr>
      </table>
      <p style="margin-top:16px;color:#666;">Файл прикреплён к письму.</p>
      ${consentBlock}
    `,
    attachments: [
      {
        filename: file.name,
        content: file.buffer,
      },
    ],
  };

  await transporter.sendMail(mailOptions);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
