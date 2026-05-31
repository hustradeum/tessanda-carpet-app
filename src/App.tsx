import { useState, useEffect, type FormEvent } from "react";
import PatternPicker from "./components/PatternPicker.js";
import ColorPicker from "./components/ColorPicker.js";
import SizePicker from "./components/SizePicker.js";
import CarpetPreview from "./components/CarpetPreview.js";
import type { ColorEntry } from "./components/CarpetPreview.js";
import Form from "./components/Form.js";

// API URL injected by the Liquid block via data-api-url attribute
declare global {
  interface Window {
    __CARPET_API_URL__: string;
  }
}

function getApiUrl(path: string): string {
  const base = (window.__CARPET_API_URL__ ?? "").replace(/\/$/, "");
  return `${base}${path}`;
}

export default function App() {
  const [width, setWidth] = useState(126);
  const [height, setHeight] = useState(90);
  const tileWidth = 7;
  const tileHeight = 9;
  const [activeRow, setActiveRow] = useState<string | undefined>();
  const [activePattern, setActivePattern] = useState("Halbraute");
  const [activeColor1, setActiveColor1] = useState<string | undefined>();
  const [activeColor2, setActiveColor2] = useState<string | undefined>();
  const [colors, setColors] = useState<Record<string, ColorEntry>>({});
  const [formOpen, setFormOpen] = useState(0);
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [mail, setMail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const handleWidthChange = (_name: string, value: string) => setWidth(parseInt(value, 10));
  const handleHeightChange = (_name: string, value: string) => setHeight(parseInt(value, 10));
  const handleRowSelection = (row: string) => setActiveRow(row);
  const handlePatternChange = (pattern: string) => setActivePattern(pattern);

  const handleColorChange = (color: string, type: "color1" | "color2") => {
    if (type === "color1") setActiveColor1(color);
    else setActiveColor2(color);

    if (activeRow) {
      setColors((prev) => ({
        ...prev,
        [activeRow]: { ...prev[activeRow], row: activeRow, [type]: color },
      }));
    }
  };

  const onFillAllButtonClick = () => {
    const rows = Math.floor(height / tileHeight);
    const newColors: Record<string, ColorEntry> = {};

    if (activeColor1 && !activeColor2) {
      for (let step = 0; step < rows; step += 1) {
        const rowNumber = step + 1;
        const topId = `${rowNumber}-top`;
        const bottomId = `${rowNumber}-bottom`;
        newColors[topId] = { row: topId, color1: activeColor1, color2: "" };
        newColors[bottomId] = { row: bottomId, color1: activeColor1, color2: "" };
      }
    }

    if (activeColor2 && !activeColor1) {
      for (let step = 0; step < rows; step += 1) {
        const rowNumber = step + 1;
        const topId = `${rowNumber}-top`;
        const bottomId = `${rowNumber}-bottom`;
        newColors[topId] = { row: topId, color1: "", color2: activeColor2 };
        newColors[bottomId] = { row: bottomId, color1: "", color2: activeColor2 };
      }
    }

    if (activeColor1 && activeColor2) {
      for (let step = 0; step < rows; step += 1) {
        const rowNumber = step + 1;
        const topId = `${rowNumber}-top`;
        const bottomId = `${rowNumber}-bottom`;
        newColors[topId] = { row: topId, color1: activeColor1, color2: activeColor2 };
        newColors[bottomId] = { row: bottomId, color1: activeColor1, color2: activeColor2 };
      }
    }

    setColors(newColors);
  };

  const onResetButtonClick = () => setColors({});

  const onDownloadAsPDF = async () => {
    try {
      const response = await fetch(getApiUrl("/api/generate-pdf"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ width, height, pattern: activePattern, colors }),
      });
      const result = await response.json() as { success: boolean; pdf?: string; filename?: string };
      if (result.success && result.pdf) {
        const bytes = Uint8Array.from(atob(result.pdf), (c) => c.charCodeAt(0));
        const blob = new Blob([bytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = result.filename ?? "tessanda-teppich.pdf";
        a.click();
        URL.revokeObjectURL(url);
      } else {
        alert("PDF konnte nicht erstellt werden. Bitte versuchen Sie es später erneut.");
      }
    } catch {
      alert("PDF konnte nicht erstellt werden. Bitte versuchen Sie es später erneut.");
    }
  };

  const onOpenForm = () => setFormOpen(1);

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormOpen(2);
    try {
      const response = await fetch(getApiUrl("/api/send-quote"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstname, lastname, phone, mail, message, width, height, pattern: activePattern, colors }),
      });
      const result = await response.json() as { success: boolean };
      setFormOpen(result.success ? 3 : 4);
    } catch {
      setFormOpen(4);
    }
  };

  // Load carpet from URL param (backward-compat with WP version)
  useEffect(() => {
    const urlCarpet = new URLSearchParams(window.location.search).get("loadCarpet");
    if (urlCarpet) {
      try {
        const loaded = JSON.parse(decodeURIComponent(urlCarpet)) as Record<string, ColorEntry>;
        setColors(loaded);
      } catch {
        // ignore invalid param
      }
    }
  }, []);

  return (
    <>
      <div className="carpet-preview">
        <CarpetPreview
          width={width}
          height={height}
          tileWidth={tileWidth}
          tileHeight={tileHeight}
          pattern={activePattern}
          colors={colors}
          handleRowSelection={handleRowSelection}
        />
      </div>

      <div className="carpet-controls">
        <PatternPicker activePattern={activePattern} handlePatternChange={handlePatternChange} />
        <SizePicker
          width={width}
          height={height}
          tileWidth={tileWidth}
          tileHeight={tileHeight}
          handleWidthChange={handleWidthChange}
          handleHeightChange={handleHeightChange}
        />
        <ColorPicker type="color1" activeColor={activeColor1 ?? ""} title="Farbe 1" handleColorChange={handleColorChange} />
        <ColorPicker type="color2" activeColor={activeColor2 ?? ""} title="Farbe 2" handleColorChange={handleColorChange} />
        <button
          type="button"
          className="carpetconfigurator-button button--fillall"
          disabled={!activeColor1 && !activeColor2}
          onClick={onFillAllButtonClick}
        >
          Ganzen Teppich füllen
        </button>
        <button
          type="button"
          className="carpetconfigurator-button button--reset"
          onClick={onResetButtonClick}
        >
          Alle Farben zurücksetzen
        </button>
      </div>

      <div className="carpet-save-options">
        <h5>Ihre nächsten Schritte</h5>
        <button type="button" className="carpetconfigurator-button button--download" onClick={onDownloadAsPDF}>
          Als PDF herunterladen
        </button>
        <button type="button" className="carpetconfigurator-button button--submit" onClick={onOpenForm}>
          Offerte anfordern
        </button>
      </div>

      {formOpen === 1 && (
        <Form
          handleFormSubmit={handleFormSubmit}
          setFirstname={setFirstname}
          setLastname={setLastname}
          setMail={setMail}
          setPhone={setPhone}
          setMessage={setMessage}
        />
      )}
      {formOpen === 2 && (
        <div className="send-carpet-form">
          <div className="send-carpet-form__title">Offerte anfordern</div>
          <div className="send-carpet-form__form">Ihre Anfrage wird erstellt…</div>
        </div>
      )}
      {formOpen === 3 && (
        <div className="send-carpet-form success">
          <div className="send-carpet-form__title">Offerte anfordern</div>
          <div className="send-carpet-form__form">Besten Dank. Die Offerte wurde erfolgreich gesendet.</div>
        </div>
      )}
      {formOpen >= 4 && (
        <div className="send-carpet-form error">
          <div className="send-carpet-form__title">Offerte anfordern</div>
          <div className="send-carpet-form__form">Beim Einsenden der Offerte ist ein Fehler aufgetreten.</div>
        </div>
      )}
    </>
  );
}
