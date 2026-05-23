import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { generateCarpetPdf } from "../lib/pdf.server.js";
import type { CarpetColors } from "../lib/carpet-html.server.js";

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
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  if (request.method !== "POST") {
    return json({ success: false, error: "Method not allowed" }, { status: 405, headers: corsHeaders() });
  }

  let body: { width: number; height: number; pattern: string; colors: CarpetColors };
  try {
    body = await request.json();
  } catch {
    return json({ success: false, error: "Invalid JSON" }, { status: 400, headers: corsHeaders() });
  }

  try {
    const pdfBuffer = await generateCarpetPdf({
      width: body.width,
      height: body.height,
      pattern: body.pattern,
      colors: body.colors,
    });

    // Return PDF as base64 so the browser can open it as a download
    return json(
      {
        success: true,
        pdf: pdfBuffer.toString("base64"),
        filename: `tessanda-teppich-${new Date().toISOString().slice(0, 10)}.pdf`,
      },
      { headers: corsHeaders() }
    );
  } catch (err) {
    console.error("generate-pdf error:", err);
    return json(
      { success: false, error: "PDF konnte nicht erstellt werden" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
