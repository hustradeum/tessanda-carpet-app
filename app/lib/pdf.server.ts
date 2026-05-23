import type { CarpetData } from "./carpet-html.server.js";
import { buildCarpetHtml } from "./carpet-html.server.js";

// Generates a PDF Buffer from carpet configuration.
// Uses Puppeteer to render HTML (identical SVG rendering to browser).
// Returns raw PDF bytes — caller attaches to email or sends as download.
export async function generateCarpetPdf(data: CarpetData): Promise<Buffer> {
  const html = buildCarpetHtml(data);

  // Dynamic import so this only runs server-side
  const puppeteer = await import("puppeteer");
  const browser = await puppeteer.default.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "15mm", right: "15mm", bottom: "15mm", left: "15mm" },
    });
    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
