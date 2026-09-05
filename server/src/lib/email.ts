import sgMail from '@sendgrid/mail';

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

const UNSUBSCRIBE_NOTE =
  'Detta är ett transaktionsmejl kopplat till ditt konto på DödsboGuiden. Du kan när som helst radera ditt konto under Inställningar för att sluta ta emot mejl.';

async function send(to: string, subject: string, html: string, text: string): Promise<boolean> {
  if (!apiKey) {
    console.log(`[email stub] To: ${to}\nSubject: ${subject}\n\n${text}`);
    return true;
  }

  try {
    await sgMail.send({ to, from: { email: fromEmail, name: fromName }, subject, text, html });
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
  return send(
    email,
    'Verifiera din DödsboGuiden-account',
    `<p>Hej ${name},</p>` +
      `<p>Tack för att du skapat ett konto på DödsboGuiden. Klicka på länken nedan för att verifiera din e-postadress. Länken är giltig i 24 timmar.</p>` +
      `<p><a href="${verifyLink}">${verifyLink}</a></p>` +
      `<p>Om du inte skapade det här kontot kan du bortse från mejlet.</p>` +
      `<p style="color:#666;font-size:12px">${UNSUBSCRIBE_NOTE}</p>`,
    `Hej ${name},\n\nTack för att du skapat ett konto på DödsboGuiden. Klicka på länken nedan för att verifiera din e-postadress (giltig i 24 timmar):\n${verifyLink}\n\n` +
      `Om du inte skapade det här kontot kan du bortse från mejlet.\n\n${UNSUBSCRIBE_NOTE}`,
  );
}

export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  return send(
    email,
    'Välkommen till DödsboGuiden',
    `<p>Hej ${name},</p>` +
      `<p>Din e-postadress är nu verifierad och ditt konto är klart att användas.</p>` +
      `<p>I DödsboGuiden kan du:</p>` +
      `<ul>` +
      `<li>Följa en checklista genom hela dödsboprocessen, uppdelad i tydliga faser</li>` +
      `<li>Bjuda in familjemedlemmar för att samarbeta</li>` +
      `<li>Hålla koll på inventarielista, dokument och ekonomi på ett ställe</li>` +
      `<li>Få vägledning inför bouppteckningen</li>` +
      `</ul>` +
      `<p>Logga in för att komma igång.</p>` +
      `<p style="color:#666;font-size:12px">${UNSUBSCRIBE_NOTE}</p>`,
    `Hej ${name},\n\nDin e-postadress är nu verifierad och ditt konto är klart att användas.\n\n` +
      `I DödsboGuiden kan du:\n` +
      `- Följa en checklista genom hela dödsboprocessen, uppdelad i tydliga faser\n` +
      `- Bjuda in familjemedlemmar för att samarbeta\n` +
      `- Hålla koll på inventarielista, dokument och ekonomi på ett ställe\n` +
      `- Få vägledning inför bouppteckningen\n\n` +
      `Logga in för att komma igång.\n\n${UNSUBSCRIBE_NOTE}`,
  );
}
