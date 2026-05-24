import { redirect } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import crypto from "node:crypto";

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
  const code = url.searchParams.get("code");
  const hmac = url.searchParams.get("hmac");

  if (!shop || !code) {
    return new Response("Missing parameters", { status: 400 });
  }

  const apiSecret = process.env.SHOPIFY_API_SECRET!;
  const params: Record<string, string> = {};
  url.searchParams.forEach((v, k) => { params[k] = v; });

  if (!validateHmac(params, apiSecret)) {
    return new Response("Invalid HMAC", { status: 400 });
  }

  // Exchange code for access token
  const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.SHOPIFY_API_KEY,
      client_secret: apiSecret,
      code,
    }),
  });

  if (!tokenRes.ok) {
    return new Response("Token exchange failed", { status: 500 });
  }

  // App is now installed — redirect merchant to their Shopify admin
  return redirect(`https://${shop}/admin`);
}
