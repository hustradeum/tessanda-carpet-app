// Generates the HTML used for PDF rendering.
// Mirrors create-carpet-pdf.php exactly: same logo, same CSS, same SVG tile paths.

export interface CarpetColors {
  [rowId: string]: { row: string; color1?: string; color2?: string };
}

export interface CarpetData {
  width: number;
  height: number;
  pattern: string;
  colors: CarpetColors;
}



// Full TileTop SVG paths — identical to TileTop.jsx and WP create-carpet-pdf.php
function tileTopSvg(color1: string, color2: string): string {
  return `<svg width="18" height="9" viewBox="0 0 18 9" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:top;">
    <path d="M0 0H9L0 9V0Z" fill="${color1}"/>
    <path d="M18 0V9L9 0H18Z" fill="${color1}"/>
    <path d="M9 0L18 9H0L9 0Z" fill="${color2}"/>
  </svg>`;
}

// Full TileBottom Halbraute SVG — identical to TileBottom.jsx and WP
function tileBottomHalbrauteSvg(color1: string, color2: string): string {
  return `<svg width="18" height="9" viewBox="0 0 18 9" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:top;">
    <path d="M0 9V0L9 9H0Z" fill="${color2}"/>
    <path d="M18 9H9L18 0V9Z" fill="${color2}"/>
    <path d="M9 9L0 0L18 0L9 9Z" fill="${color1}"/>
  </svg>`;
}

// Full TileBottom Zickzack SVG — identical to TileBottom.jsx and WP
function tileBottomZickzackSvg(color1: string, color2: string): string {
  return `<svg width="18" height="9" viewBox="0 0 18 9" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:top;">
    <path d="M0 0L9 0L0 9V0Z" fill="${color2}"/>
    <path d="M18 0V9L9 0H18Z" fill="${color2}"/>
    <path d="M9 0L18 9H0L9 0Z" fill="${color1}"/>
  </svg>`;
}

function toImg(svg: string): string {
  return svg;
}

export function buildCarpetHtml(data: CarpetData): string {
  const { width, height, pattern, colors } = data;
  const columns = Math.floor(width / 7);
  const rows = Math.floor(height / 9);
  const defaultColor1 = "#B1B1B1";
  const defaultColor2 = "#ffffff";

  const uniqueColors = new Set<string>();
  Object.values(colors).forEach((c) => {
    if (c.color1) uniqueColors.add(c.color1);
    if (c.color2) uniqueColors.add(c.color2);
  });

  const now = new Date();
  const dateStr = now.toLocaleDateString("de-CH", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  let rowsHtml = "";
  for (let i = 1; i <= rows; i++) {
    const topColors = colors[`${i}-top`] ?? {};
    const bottomColors = colors[`${i}-bottom`] ?? {};
    const topC1 = topColors.color1 || defaultColor1;
    const topC2 = topColors.color2 || defaultColor2;
    const botC1 = bottomColors.color1 || defaultColor1;
    const botC2 = bottomColors.color2 || defaultColor2;

    let topTiles = "";
    let botTiles = "";
    for (let c = 0; c < columns; c++) {
      topTiles += toImg(tileTopSvg(topC1, topC2));
      botTiles += toImg(pattern === "Halbraute"
        ? tileBottomHalbrauteSvg(botC1, botC2)
        : tileBottomZickzackSvg(botC1, botC2));
    }

    rowsHtml += `
      <tr>
        <td class="rn" rowspan="2">${i}</td>
        <td class="tiles">${topTiles}</td>
      </tr>
      <tr>
        <td class="tiles">${botTiles}</td>
      </tr>`;
  }



  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <style>
    html, body { font-family: sans-serif; font-size: 14px; margin: 20px; }
    h1 { font-size: 18px; font-weight: bold; color: #ae5c56; margin: 0 0 8px 0; }
    table.info { border-collapse: collapse; margin-bottom: 16px; }
    table.info td { padding: 2px 12px 2px 0; vertical-align: top; }
    .header { margin-bottom: 8px; }
    .carpet-preview { border: 1px solid #ccc; margin: 1.5rem 0; padding: 1.5rem 2rem; }
    img { display: inline-block; }
    table.carpet { border-collapse: collapse; margin: 0 auto; }
    td.rn {
      font-size: 8px; color: #888; font-family: sans-serif;
      text-align: right; vertical-align: middle;
      padding: 0 4px 0 0; white-space: nowrap; width: 14px; line-height: 1;
    }
    td.tiles { padding: 0; line-height: 0; font-size: 0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Teppichkonfigurator tessanda.ch</h1>
    <table class="info">
      <tr><td><strong>Datum</strong></td><td>${dateStr} Uhr</td></tr>
      <tr><td><strong>Muster</strong></td><td>${pattern}</td></tr>
      <tr><td><strong>Breite</strong></td><td>${width} cm</td></tr>
      <tr><td><strong>Höhe</strong></td><td>${height} cm</td></tr>
      <tr><td><strong>Anzahl Farben</strong></td><td>${uniqueColors.size} Farben</td></tr>
    </table>
  </div>
  <div class="carpet-preview">
    <table class="carpet">
      ${rowsHtml}
    </table>
  </div>
</body>
</html>`;
}
