import { redirect } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import crypto from "node:crypto";

// In-memory nonce store for OAuth state validation (lasts only seconds)
const pendingNonces = new Set<string>();

function validateHmac(params: Record<string, string>, secret: string): boolean {
  const { hmac, ...rest } = params;
  if (!hmac) return false;
  const msg = Object.keys(rest).sort().map((k) => `${k}=${rest[k]}`).join("&");
  const expected = crypto.createHmac("sha256", secret).update(msg).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(hmac, "hex"));
  } catch {
    return false;
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  // No shop param → show admin panel
  if (!shop) return redirect("/app");

  // Validate HMAC if present
  const apiSecret = process.env.SHOPIFY_API_SECRET;
  const hmac = url.searchParams.get("hmac");
  if (apiSecret && hmac) {
    const params: Record<string, string> = {};
    url.searchParams.forEach((v, k) => { params[k] = v; });
    if (!validateHmac(params, apiSecret)) {
      return new Response("Invalid HMAC", { status: 400 });
    }
  }

  // Start OAuth: generate nonce and redirect to Shopify
  const nonce = crypto.randomBytes(16).toString("hex");
  pendingNonces.add(nonce);
  setTimeout(() => pendingNonces.delete(nonce), 10 * 60 * 1000);

  const appUrl = process.env.SHOPIFY_APP_URL ?? `${url.protocol}//${url.host}`;
  const redirectUri = `${appUrl}/auth/callback`;
  const scopes = "write_themes";
  const apiKey = process.env.SHOPIFY_API_KEY ?? "";

  const authUrl =
    `https://${shop}/admin/oauth/authorize` +
    `?client_id=${apiKey}` +
    `&scope=${scopes}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&state=${nonce}`;

  return redirect(authUrl);
}

export default function Index() {
  return <div>Wird weitergeleitet…</div>;
}
