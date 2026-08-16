// Quote emails go out through Resend's HTTPS API. SMTP is not an option here:
// the production host blocks outbound port 465 (connect hangs ~123s), which is
// what silently broke every quote submission.
export interface QuoteEmailData {
  firstname: string;
  lastname: string;
  mail: string;
  phone: string;
  message: string;
  width: number;
  height: number;
  pattern: string;
}

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const BRAND = "#ae5c56"; // Tessanda accent, matches the PDF heading

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function configRows(data: QuoteEmailData): string {
  const row = (label: string, value: string) =>
    `<tr><td style="padding:2px 16px 2px 0;color:#666;">${label}</td><td style="padding:2px 0;font-weight:600;">${escapeHtml(value)}</td></tr>`;
  return `
    ${row("Muster", data.pattern)}
    ${row("Grösse", `${data.width} × ${data.height} cm`)}`;
}

function shell(inner: string): string {
  return `<body style="margin:0;padding:0;background:#f5f5f5;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:24px 0;">
      <tr><td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border:1px solid #e5e5e5;border-radius:8px;overflow:hidden;font-family:Helvetica,Arial,sans-serif;color:#222;">
          <tr><td style="background:${BRAND};padding:20px 32px;">
            <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:0.02em;">Tessanda Handweberei</span>
          </td></tr>
          <tr><td style="padding:32px;font-size:15px;line-height:1.6;">
            ${inner}
          </td></tr>
          <tr><td style="padding:20px 32px;border-top:1px solid #eee;color:#999;font-size:12px;line-height:1.5;">
            Tessanda Handweberei ·
            <a href="https://tessanda.ch" style="color:${BRAND};text-decoration:none;">tessanda.ch</a>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>`;
}

function customerBody(data: QuoteEmailData): string {
  return shell(`
    <p style="margin:0 0 16px;">Guten Tag ${escapeHtml(data.firstname)} ${escapeHtml(data.lastname)}</p>
    <p style="margin:0 0 16px;">
      Vielen Dank für Ihre Anfrage über unseren Teppichkonfigurator.
      Wir haben Ihren Entwurf erhalten und melden uns zeitnah mit einem
      massgeschneiderten Angebot bei Ihnen.
    </p>
    <p style="margin:0 0 8px;font-weight:600;">Ihre Konfiguration</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 16px;font-size:14px;">
      ${configRows(data)}
    </table>
    <p style="margin:0 0 16px;color:#666;font-size:14px;">
      Die vollständige Konfiguration finden Sie im angehängten PDF.
    </p>
    <p style="margin:0;">Herzliche Grüsse<br>Ihr Tessanda-Team</p>
  `);
}

function adminBody(data: QuoteEmailData): string {
  const row = (label: string, value: string) =>
    `<tr><td style="padding:3px 16px 3px 0;color:#666;white-space:nowrap;">${label}</td><td style="padding:3px 0;font-weight:600;">${escapeHtml(value)}</td></tr>`;
  return shell(`
    <p style="margin:0 0 16px;font-weight:600;">Neue Anfrage über den Teppichkonfigurator</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 16px;font-size:14px;">
      ${row("Vorname", data.firstname)}
      ${row("Nachname", data.lastname)}
      ${row("E-Mail", data.mail)}
      ${row("Telefon", data.phone)}
      ${row("Nachricht", data.message || "—")}
      ${row("Muster", data.pattern)}
      ${row("Grösse", `${data.width} × ${data.height} cm`)}
    </table>
    <p style="margin:0;color:#666;font-size:14px;">
      Der Teppichentwurf ist als PDF angehängt. Ein Klick auf «Antworten»
      geht direkt an die Kundin / den Kunden.
    </p>
  `);
}

async function send(
  apiKey: string,
  from: string,
  subject: string,
  html: string,
  attachment: { filename: string; content: string },
  to: string,
  replyTo?: string
): Promise<void> {
  const response = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
      attachments: [attachment],
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    // Pass Resend's own message through — an unverified sender domain reports
    // a 403 here, otherwise indistinguishable from a generic failure.
    const detail = await response.text().catch(() => "");
    throw new Error(`Resend ${response.status} für ${to}: ${detail}`);
  }
}

export async function sendQuoteEmails(
  data: QuoteEmailData,
  pdfBuffer: Buffer
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY ist nicht gesetzt");

  const from = process.env.MAIL_FROM ?? "Tessanda Handweberei <shop@tessanda.ch>";
  const admins = [
    process.env.ADMIN_EMAIL ?? "allegra@tessanda.ch",
    ...(process.env.ADMIN_EMAIL_2 ? [process.env.ADMIN_EMAIL_2] : []),
  ];

  const attachment = {
    filename: `tessanda-teppich-${new Date().toISOString().slice(0, 10)}.pdf`,
    content: pdfBuffer.toString("base64"),
  };

  // Confirmation to the customer
  await send(
    apiKey,
    from,
    "Ihre Anfrage bei der Tessanda Handweberei",
    customerBody(data),
    attachment,
    data.mail
  );

  // Notification to each admin, Reply-To pointing back at the customer
  for (const admin of admins) {
    await send(
      apiKey,
      from,
      "Neue Anfrage Teppichkonfigurator",
      adminBody(data),
      attachment,
      admin,
      `${data.firstname} ${data.lastname} <${data.mail}>`
    );
  }
}

export interface EmailConfigStatus {
  configured: boolean;
  from: string;
  admins: string[];
}

export function checkEmailConfig(): EmailConfigStatus {
  return {
    configured: Boolean(process.env.RESEND_API_KEY),
    from: process.env.MAIL_FROM ?? "Tessanda Handweberei <shop@tessanda.ch>",
    admins: [
      process.env.ADMIN_EMAIL ?? "allegra@tessanda.ch",
      ...(process.env.ADMIN_EMAIL_2 ? [process.env.ADMIN_EMAIL_2] : []),
    ],
  };
}
