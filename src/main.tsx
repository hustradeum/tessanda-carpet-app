import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.js";
import "./App.css";

// Fallback for when the theme block's "App API URL" setting is left empty.
// Without it the base URL stays "" and every request resolves relative to the
// storefront (tessanda.ch/api/...) instead of the app, so Shopify answers with
// a 404 HTML page and both PDF download and quote submission fail silently.
const DEFAULT_API_URL = "https://tessanda.tradeumcloud.ch";

const el = document.getElementById("tessanda-carpet-configurator");
if (el) {
  const configured = (el.dataset.apiUrl ?? "").trim();
  if (!configured) {
    console.warn(
      '[Teppichkonfigurator] Block-Einstellung "App API URL" ist leer — ' +
        `Fallback auf ${DEFAULT_API_URL}.`
    );
  }
  window.__CARPET_API_URL__ = configured || DEFAULT_API_URL;
  createRoot(el).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
