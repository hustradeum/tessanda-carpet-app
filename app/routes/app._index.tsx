import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { checkEmailConfig } from "../lib/email.server.js";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;
  const mail = checkEmailConfig();
  return json({ baseUrl, mail });
}

export default function Index() {
  const { baseUrl, mail } = useLoaderData<typeof loader>();

  return (
    <div style={{ maxWidth: 640, margin: "40px auto", fontFamily: "sans-serif", padding: "0 20px" }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Tessanda Teppich Konfigurator</h1>
      <p style={{ color: "#666", marginBottom: 32 }}>Shopify App Admin</p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, marginBottom: 12 }}>Status</h2>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <tbody>
            <tr>
              <td style={{ padding: "8px 16px 8px 0", fontWeight: 600 }}>E-Mail-Versand (Resend)</td>
              <td>
                <span style={{ color: mail.configured ? "#22c55e" : "#ef4444", fontWeight: 600 }}>
                  {mail.configured
                    ? "✓ API-Key gesetzt"
                    : "✗ RESEND_API_KEY fehlt — Offerten können nicht versendet werden"}
                </span>
              </td>
            </tr>
            <tr>
              <td style={{ padding: "8px 16px 8px 0", fontWeight: 600 }}>Absender</td>
              <td style={{ fontFamily: "monospace", fontSize: 13 }}>{mail.from}</td>
            </tr>
            <tr>
              <td style={{ padding: "8px 16px 8px 0", fontWeight: 600 }}>Empfänger intern</td>
              <td style={{ fontFamily: "monospace", fontSize: 13 }}>{mail.admins.join(", ")}</td>
            </tr>
            <tr>
              <td style={{ padding: "8px 16px 8px 0", fontWeight: 600 }}>App URL</td>
              <td style={{ fontFamily: "monospace", fontSize: 13 }}>{baseUrl}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, marginBottom: 12 }}>Konfigurator aktivieren</h2>
        <ol style={{ lineHeight: 2, paddingLeft: 20 }}>
          <li>Shopify Admin → <strong>Online Store → Themes → Customize</strong></li>
          <li>Seite auswählen (z.B. eine leere Seite "Teppichkonfigurator")</li>
          <li>Links im Theme-Editor: <strong>Add block → Teppich Konfigurator</strong></li>
          <li>
            Block-Einstellung <strong>«App API URL»</strong> auf diese URL setzen:
            <br />
            <code style={{ background: "#f3f4f6", padding: "4px 8px", borderRadius: 4, fontSize: 13 }}>
              {baseUrl}
            </code>
          </li>
          <li>Speichern → Vorschau → fertig</li>
        </ol>
      </section>

      <section>
        <h2 style={{ fontSize: 18, marginBottom: 12 }}>API Endpunkte</h2>
        <table style={{ borderCollapse: "collapse", fontSize: 13, width: "100%" }}>
          <tbody>
            <tr>
              <td style={{ padding: "6px 16px 6px 0", fontFamily: "monospace" }}>POST /api/send-quote</td>
              <td>E-Mail + PDF versenden</td>
            </tr>
            <tr>
              <td style={{ padding: "6px 16px 6px 0", fontFamily: "monospace" }}>POST /api/generate-pdf</td>
              <td>PDF als base64 zurückgeben</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}
