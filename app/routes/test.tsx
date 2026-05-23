import type { LoaderFunctionArgs } from "@remix-run/node";

export function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const apiUrl = `${url.protocol}//${url.host}`;
  const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tessanda Teppich Konfigurator – Test</title>
  <link rel="stylesheet" href="/assets/carpet-configurator.css">
  <style>
    body { font-family: sans-serif; padding: 20px; background: #f5f5f5; }
    h1 { color: #6A231E; font-size: 1.4rem; margin-bottom: 24px; }
    #tessanda-carpet-configurator { background: white; padding: 24px; border-radius: 8px; }
  </style>
</head>
<body>
  <h1>Tessanda Teppich Konfigurator – Testseite</h1>
  <div id="tessanda-carpet-configurator" data-api-url="${apiUrl}"></div>
  <script src="/assets/carpet-configurator.js" defer></script>
</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
