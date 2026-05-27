import type { LoaderFunctionArgs } from "@remix-run/node";

export function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const apiUrl = process.env.SHOPIFY_APP_URL ?? `https://${url.host}`;
  const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Teppichkonfigurator – Tessanda Handweberei</title>
  <link rel="stylesheet" href="https://use.typekit.net/dow1pxc.css">
  <link rel="stylesheet" href="/assets/carpet-configurator.css">
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html {
      font-family: europa, sans-serif;
      font-size: 26px;
      letter-spacing: 0.025em;
      line-height: 1.4;
      color: #333;
    }
    @media (max-width: 700px) {
      html { font-size: 16px; }
    }
    body {
      margin: 0;
      padding: 0;
      background: #fff;
    }
    .wrapper {
      max-width: 1248px;
      width: 90vw;
      margin: 0 auto;
      padding: 1px 0;
    }
    .login-hint {
      background: #bb635d;
      color: #fff;
      padding: 1rem;
      margin-bottom: 2rem;
      font-size: 0.8rem;
      line-height: 1.5;
    }
    .element-carpetconfigurator {
      margin: 5vw auto;
    }
    .carpet-configurator__intro {
      margin-bottom: 1.5rem;
    }
    .carpet-configurator__intro h1 {
      font-size: 2rem;
      font-weight: 700;
      letter-spacing: normal;
      color: #6a231e;
      margin: 0 0 0.25rem 0;
    }
    .carpet-configurator__intro h5 {
      font-size: 0.8rem;
      font-weight: 400;
      color: rgb(120, 120, 120);
      margin: 0;
      letter-spacing: 0.025em;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="login-hint">
      Melden Sie sich an, um Ihren Teppich in Ihrem Kundenkonto zu speichern und später weiterzubearbeiten.
    </div>
    <div class="element-carpetconfigurator">
      <div class="carpet-configurator__intro">
        <h1>Teppichkonfigurator</h1>
        <h5>Gestalten Sie Ihren Wunschteppich selbst</h5>
      </div>
      <div id="tessanda-carpet-configurator" class="carpet-configurator" data-api-url="${apiUrl}"></div>
    </div>
  </div>
  <script src="/assets/carpet-configurator.js" defer></script>
</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
