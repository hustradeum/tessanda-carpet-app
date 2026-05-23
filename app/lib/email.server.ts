import nodemailer from "nodemailer";

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

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "mail.cyon.ch",
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: true, // SSL on port 465
    auth: {
      user: process.env.SMTP_USER ?? "",
      pass: process.env.SMTP_PASS ?? "",
    },
  });
}

function buildEmailBody(data: QuoteEmailData): string {
  return `<body style="background-color:#FFFFFF;color:#000000;font-family:sans-serif;font-size:14px;line-height:1.4;">
    <table cellpadding="0" cellspacing="0" style="color:#000000;font-family:sans-serif;font-size:14px;">
      <tr><td><strong style="margin-right:10px">Vorname</strong></td><td>${data.firstname}</td></tr>
      <tr><td><strong style="margin-right:10px">Nachname</strong></td><td>${data.lastname}</td></tr>
      <tr><td><strong style="margin-right:10px">E-Mail-Adresse</strong></td><td>${data.mail}</td></tr>
      <tr><td><strong style="margin-right:10px">Telefon</strong></td><td>${data.phone}</td></tr>
      <tr><td><strong style="margin-right:10px">Nachricht</strong></td><td>${data.message ?? ""}</td></tr>
    </table>
  </body>`;
}

export async function sendQuoteEmails(
  data: QuoteEmailData,
  pdfBuffer: Buffer
): Promise<void> {
  const transporter = createTransporter();
  const body = buildEmailBody(data);
  const fromName = "Tessanda Handweberei";
  const fromAddr = process.env.SMTP_USER ?? "shop@tessanda.ch";
  const adminEmail = process.env.ADMIN_EMAIL ?? "allegra@tessanda.ch";

  const attachment = {
    filename: `tessanda-teppich-${new Date().toISOString().slice(0, 10)}.pdf`,
    content: pdfBuffer,
    contentType: "application/pdf",
  };

  // Confirmation to customer
  await transporter.sendMail({
    from: `"${fromName}" <${fromAddr}>`,
    to: data.mail,
    subject: "Bestätigung Anfrage Teppichkonfigurator",
    html: body,
    attachments: [attachment],
  });

  // Notification to admin with Reply-To pointing to customer
  await transporter.sendMail({
    from: `"${fromName}" <${fromAddr}>`,
    to: adminEmail,
    replyTo: `${data.firstname} ${data.lastname} <${data.mail}>`,
    subject: "Neue Anfrage Teppichkonfigurator",
    html: body,
    attachments: [attachment],
  });
}

export async function testSmtpConnection(): Promise<boolean> {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    return true;
  } catch {
    return false;
  }
}
