import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.js";
import "./App.css";

const el = document.getElementById("tessanda-carpet-configurator");
if (el) {
  window.__CARPET_API_URL__ = el.dataset.apiUrl ?? "";
  createRoot(el).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
