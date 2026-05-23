import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { generateCarpetPdf } from "../lib/pdf.server.js";
import { sendQuoteEmails } from "../lib/email.server.js";
import type { CarpetColors } from "../lib/carpet-html.server.js";

// CORS headers — TAE runs on *.myshopify.com, needs cross-origin access
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function loader() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function action({ request }: ActionFunctionArgs) {
  // Handle preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  if (request.method !== "POST") {
    return json({ success: false, error: "Method not allowed" }, { status: 405, headers: corsHeaders() });
  }

  let body: {
    firstname: string;
    lastname: string;
    mail: string;
    phone: string;
    message?: string;
    width: number;
    height: number;
    pattern: string;
    colors: CarpetColors;
  };

  try {
    body = await request.json();
  } catch {
    return json({ success: false, error: "Invalid JSON" }, { status: 400, headers: corsHeaders() });
  }

  // Basic validation
  if (!body.firstname || !body.lastname || !body.mail || !body.phone) {
    return json({ success: false, error: "Pflichtfelder fehlen" }, { status: 400, headers: corsHeaders() });
  }

  try {
    const pdfBuffer = await generateCarpetPdf({
      width: body.width,
      height: body.height,
      pattern: body.pattern,
      colors: body.colors,
    });

    await sendQuoteEmails(
      {
        firstname: body.firstname,
        lastname: body.lastname,
        mail: body.mail,
        phone: body.phone,
        message: body.message ?? "",
        width: body.width,
        height: body.height,
        pattern: body.pattern,
      },
      pdfBuffer
    );

    return json({ success: true }, { headers: corsHeaders() });
  } catch (err) {
    console.error("send-quote error:", err);
    return json(
      { success: false, error: "Interner Fehler beim Versenden" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
