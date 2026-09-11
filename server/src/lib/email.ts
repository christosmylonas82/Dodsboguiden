import sgMail from '@sendgrid/mail';
import { getPrimaryClientOrigin } from './clientOrigin.js';

// Falls back to console-logging the message when SENDGRID_API_KEY isn't set
// (e.g. local dev), so nothing breaks without SendGrid configured.
const rawApiKey = process.env.SENDGRID_API_KEY?.trim();
const fromEmail = process.env.SENDGRID_FROM_EMAIL ?? 'no-reply@dodsboguiden.se';
const fromName = process.env.SENDGRID_FROM_NAME ?? 'DödsboGuiden';

// SendGrid keys always look like "SG.xxx.yyy" — a value that doesn't match is
// almost certainly a copy-paste mistake (e.g. the "KEY = " prefix or quotes
// pasted along with it). Treat it as unset rather than let every send fail.
const apiKey = rawApiKey && rawApiKey.startsWith('SG.') ? rawApiKey : undefined;

if (rawApiKey && !apiKey) {
  console.error(
    `[email] SENDGRID_API_KEY is set but doesn't start with "SG." — this looks like a copy-paste ` +
      `mistake (e.g. the variable name or quotes got included in the value). Falling back to the ` +
      `console-log stub, so verification/reset emails will NOT actually be sent until this is fixed.`,
  );
}

if (apiKey) {
  sgMail.setApiKey(apiKey);
}

const CONTACT_EMAIL = process.env.CONTACT_EMAIL ?? 'info@dodsboguiden.se';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const UNSUBSCRIBE_NOTE =
  'Detta är ett transaktionsmejl kopplat till ditt konto på DödsboGuiden. Du kan när som helst radera ditt konto under Inställningar för att sluta ta emot mejl.';

const BRAND_COLOR = '#0a4062';

/** Wraps a template's inner HTML in a consistent, email-client-safe layout (table-based, inline styles only). */
function emailLayout(title: string, bodyHtml: string): string {
  return (
    `<!doctype html>` +
    `<html lang="sv"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />` +
    `<title>${escapeHtml(title)}</title></head>` +
    `<body style="margin:0;padding:0;background-color:#f6f5f4;font-family:Arial,Helvetica,sans-serif;">` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f6f5f4;padding:32px 16px;">` +
    `<tr><td align="center">` +
    `<table role="presentation" width="100%" style="max-width:480px;background-color:#ffffff;border-radius:12px;overflow:hidden;">` +
    `<tr><td style="background-color:${BRAND_COLOR};padding:20px 32px;">` +
    `<span style="color:#ffffff;font-size:18px;font-weight:bold;">DödsboGuiden</span>` +
    `</td></tr>` +
    `<tr><td style="padding:32px;color:#37352f;font-size:15px;line-height:1.6;">${bodyHtml}</td></tr>` +
    `</table></td></tr></table></body></html>`
  );
}

async function send(to: string, subject: string, html: string, text: string, replyTo?: string): Promise<boolean> {
  if (!apiKey) {
    console.log(`[email stub] To: ${to}\nSubject: ${subject}\n\n${text}`);
    return true;
  }

  console.log(`From email about to send: ${fromEmail}`);
  console.log(`From name about to send: ${fromName}`);

  try {
    await sgMail.send({ to, from: { email: fromEmail, name: fromName }, replyTo, subject, text, html });
    return true;
  } catch (err) {
    const detail =
      err && typeof err === 'object' && 'response' in err
        ? JSON.stringify((err as { response?: { body?: unknown } }).response?.body)
        : err instanceof Error
          ? err.message
          : err;
    console.error(`[email] Failed to send "${subject}" to ${to}:`, detail);
    return false;
  }
}

export async function sendPasswordResetEmail(email: string, resetLink: string): Promise<boolean> {
  return send(
    email,
    'Återställ ditt lösenord - DödsboGuiden',
    `<p>Klicka på länken nedan för att återställa ditt lösenord. Länken är giltig i 1 timme.</p>` +
      `<p><a href="${resetLink}">${resetLink}</a></p>` +
      `<p>Om du inte begärde detta kan du bortse från mejlet.</p>` +
      `<p style="color:#666;font-size:12px">${UNSUBSCRIBE_NOTE}</p>`,
    `Klicka på länken för att återställa ditt lösenord (giltig i 1 timme):\n${resetLink}\n\n` +
      `Om du inte begärde detta kan du bortse från mejlet.\n\n${UNSUBSCRIBE_NOTE}`,
  );
}

export async function sendDeadlineReminderEmail(
  email: string,
  deceasedName: string,
  daysRemaining: number,
): Promise<boolean> {
  return send(
    email,
    `Påminnelse: ${daysRemaining} dagar kvar till bouppteckningen`,
    `<p>Dödsboet "${deceasedName}" har ${daysRemaining} dagar kvar innan bouppteckningen ska ha kommit in till Skatteverket.</p>` +
      `<p style="color:#666;font-size:12px">${UNSUBSCRIBE_NOTE}</p>`,
    `Dödsboet "${deceasedName}" har ${daysRemaining} dagar kvar innan bouppteckningen ska ha kommit in till Skatteverket.\n\n${UNSUBSCRIBE_NOTE}`,
  );
}

export async function sendVerificationEmail(email: string, name: string, verifyLink: string): Promise<boolean> {
  console.log(`From email about to send: ${fromEmail}`);
  console.log(`From name about to send: ${fromName}`);

  const safeName = escapeHtml(name);
  const safeLink = escapeHtml(verifyLink);

  const body =
    `<h1 style="margin:0 0 16px;font-size:20px;color:${BRAND_COLOR};">Bekräfta din e-postadress</h1>` +
    `<p style="margin:0 0 16px;">Hej ${safeName},</p>` +
    `<p style="margin:0 0 24px;">Tack för att du skapat ett konto på DödsboGuiden. Klicka på knappen nedan för att verifiera din e-postadress. Länken är giltig i 24 timmar.</p>` +
    `<p style="margin:0 0 24px;text-align:center;">` +
    `<a href="${safeLink}" style="display:inline-block;background-color:${BRAND_COLOR};color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:bold;font-size:15px;">Verifiera min e-post</a>` +
    `</p>` +
    `<p style="margin:0 0 24px;font-size:13px;color:#787671;">Om knappen inte fungerar kan du kopiera och klistra in denna länk i din webbläsare:<br />` +
    `<a href="${safeLink}" style="color:${BRAND_COLOR};word-break:break-all;">${safeLink}</a></p>` +
    `<p style="margin:0 0 16px;">Om du inte skapade det här kontot kan du bortse från mejlet.</p>` +
    `<hr style="border:none;border-top:1px solid #e5e3df;margin:24px 0;" />` +
    `<p style="margin:0;font-size:12px;color:#787671;">${UNSUBSCRIBE_NOTE}</p>`;

  return send(
    email,
    'Bekräfta din e-postadress – DödsboGuiden',
    emailLayout('Bekräfta din e-postadress', body),
    `Hej ${name},\n\nTack för att du skapat ett konto på DödsboGuiden. Klicka på länken nedan för att verifiera din e-postadress (giltig i 24 timmar):\n${verifyLink}\n\n` +
      `Om du inte skapade det här kontot kan du bortse från mejlet.\n\n${UNSUBSCRIBE_NOTE}`,
  );
}

export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  const safeName = escapeHtml(name);
  const loginLink = getPrimaryClientOrigin();

  const body =
    `<h1 style="margin:0 0 16px;font-size:20px;color:${BRAND_COLOR};">Välkommen till DödsboGuiden</h1>` +
    `<p style="margin:0 0 16px;">Hej ${safeName},</p>` +
    `<p style="margin:0 0 16px;">Din e-postadress är nu verifierad och ditt konto är klart att användas.</p>` +
    `<p style="margin:0 0 8px;">I DödsboGuiden kan du:</p>` +
    `<ul style="margin:0 0 24px;padding-left:20px;">` +
    `<li style="margin-bottom:4px;">Följa en checklista genom hela dödsboprocessen, uppdelad i tydliga faser</li>` +
    `<li style="margin-bottom:4px;">Bjuda in familjemedlemmar för att samarbeta</li>` +
    `<li style="margin-bottom:4px;">Hålla koll på inventarielista, dokument och ekonomi på ett ställe</li>` +
    `<li>Få vägledning inför bouppteckningen</li>` +
    `</ul>` +
    `<p style="margin:0 0 24px;text-align:center;">` +
    `<a href="${loginLink}" style="display:inline-block;background-color:${BRAND_COLOR};color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:bold;font-size:15px;">Logga in</a>` +
    `</p>` +
    `<hr style="border:none;border-top:1px solid #e5e3df;margin:24px 0;" />` +
    `<p style="margin:0;font-size:12px;color:#787671;">${UNSUBSCRIBE_NOTE}</p>`;

  return send(
    email,
    'Välkommen till DödsboGuiden',
    emailLayout('Välkommen till DödsboGuiden', body),
    `Hej ${name},\n\nDin e-postadress är nu verifierad och ditt konto är klart att användas.\n\n` +
      `I DödsboGuiden kan du:\n` +
      `- Följa en checklista genom hela dödsboprocessen, uppdelad i tydliga faser\n` +
      `- Bjuda in familjemedlemmar för att samarbeta\n` +
      `- Hålla koll på inventarielista, dokument och ekonomi på ett ställe\n` +
      `- Få vägledning inför bouppteckningen\n\n` +
      `Logga in på ${loginLink} för att komma igång.\n\n${UNSUBSCRIBE_NOTE}`,
  );
}

export async function sendContactEmail(name: string, fromAddress: string, message: string): Promise<boolean> {
  return send(
    CONTACT_EMAIL,
    `Kontaktformulär: meddelande från ${name}`,
    `<p><strong>Namn:</strong> ${escapeHtml(name)}</p>` +
      `<p><strong>E-post:</strong> ${escapeHtml(fromAddress)}</p>` +
      `<p><strong>Meddelande:</strong></p>` +
      `<p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>`,
    `Namn: ${name}\nE-post: ${fromAddress}\n\nMeddelande:\n${message}`,
    fromAddress,
  );
}

export async function sendProblemReportEmail(
  name: string,
  fromAddress: string,
  message: string,
  pageUrl?: string,
): Promise<boolean> {
  return send(
    CONTACT_EMAIL,
    `Problemrapport från ${name}`,
    `<p><strong>Namn:</strong> ${escapeHtml(name)}</p>` +
      `<p><strong>E-post:</strong> ${escapeHtml(fromAddress)}</p>` +
      (pageUrl ? `<p><strong>Sida:</strong> ${escapeHtml(pageUrl)}</p>` : '') +
      `<p><strong>Beskrivning:</strong></p>` +
      `<p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>`,
    `Namn: ${name}\nE-post: ${fromAddress}\n${pageUrl ? `Sida: ${pageUrl}\n` : ''}\nBeskrivning:\n${message}`,
    fromAddress,
  );
}
