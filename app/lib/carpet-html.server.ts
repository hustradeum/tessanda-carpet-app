// Generates the HTML used for PDF rendering.
// Mirrors create-carpet-pdf.php exactly: same logo, same table, same SVG tile paths.

export interface CarpetColors {
  [rowId: string]: { row: string; color1?: string; color2?: string };
}

export interface CarpetData {
  width: number;
  height: number;
  pattern: string;
  colors: CarpetColors;
}

const TESSANDA_SVG_B64 = Buffer.from(
  `<svg width="264" height="392" viewBox="0 0 264 392" xmlns="http://www.w3.org/2000/svg">
    <g fill="#BB635D" fill-rule="evenodd">
      <path d="M255.612 369.915v10.38c-.669.951-3.191 4.068-7.507 4.068-5.153 0-8.752-3.807-8.752-9.258 0-5.45 3.599-9.256 8.752-9.256 4.332 0 6.833 3.1 7.507 4.066m6.861-10.934h-5.05c-.747 0-1.35.59-1.35 1.32v.888c-1.845-1.47-4.771-2.977-9.016-2.977-8.924 0-15.915 7.42-15.915 16.893 0 9.474 6.99 16.895 15.915 16.895 4.245 0 7.17-1.508 9.015-2.977v.888c0 .729.604 1.32 1.35 1.32h5.051c.745 0 1.35-.591 1.35-1.32v-29.61c0-.73-.605-1.32-1.35-1.32M219.709 369.546v10.377c-.65.977-3.17 4.273-7.646 4.273-5.166 0-8.773-3.89-8.773-9.461 0-5.481 3.69-9.46 8.773-9.46 4.493 0 6.991 3.278 7.646 4.271M226.637 339h-5.565c-.753 0-1.363.604-1.363 1.348v19.806c-1.802-1.32-4.607-2.683-8.507-2.683-9.085 0-16.202 7.583-16.202 17.264S202.117 392 211.202 392c4.207 0 7.124-1.532 8.971-3.03v.896c0 .744.61 1.348 1.364 1.348h5.1c.752 0 1.363-.604 1.363-1.348v-49.518c0-.744-.61-1.348-1.363-1.348M178.033 358c-3.721 0-6.366 1.366-8.092 2.751v-.664c0-.728-.614-1.318-1.372-1.318h-5.198c-.757 0-1.371.59-1.371 1.318v29.595c0 .727.614 1.318 1.371 1.318h5.599c.757 0 1.371-.59 1.371-1.318v-20.024c.575-.922 2.773-4.025 6.292-4.025 2.251 0 6.026.769 6.026 5.92v18.129c0 .727.615 1.318 1.372 1.318h5.598c.757 0 1.371-.59 1.371-1.318v-19.025c0-3.811-1.36-7.052-3.932-9.37-2.352-2.12-5.56-3.287-9.035-3.287"/>
      <path d="M33.788 349.96v-5.226c0-.742-.59-1.345-1.319-1.345H1.32c-.728 0-1.32.603-1.32 1.345v5.227c0 .742.592 1.344 1.32 1.344h11.564v39.164c0 .742.59 1.344 1.32 1.344h5.384c.728 0 1.319-.602 1.319-1.344v-39.164h11.563c.729 0 1.32-.602 1.32-1.344"/>
    </g>
  </svg>`
).toString("base64");

// TileTop SVG — identical to TileTop.jsx (color1 = left+right triangles, color2 = center)
function tileTopSvg(color1: string, color2: string): string {
  return `<svg width="18" height="9" viewBox="0 0 18 9" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 0H9L0 9V0Z" fill="${color1}"/>
    <path d="M18 0V9L9 0H18Z" fill="${color1}"/>
    <path d="M9 0L18 9H0L9 0Z" fill="${color2}"/>
    <path d="M0.0613165 6.81122L6.80732 0.0550611L6.69409-0.0579908L-0.0519057 6.69817L0.0613165 6.81122Z" fill="#999"/>
  </svg>`;
}

// TileBottom Halbraute SVG — identical to TileBottom.jsx pattern===Halbraute
function tileBottomHalbrauteSvg(color1: string, color2: string): string {
  return `<svg width="18" height="9" viewBox="0 0 18 9" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 9V0L9 9H0Z" fill="${color2}"/>
    <path d="M18 9H9L18 0V9Z" fill="${color2}"/>
    <path d="M9 9L0 0L18 0L9 9Z" fill="${color1}"/>
    <path d="M17.9387 2.18878L11.1927 8.94494L11.306 9.05799L18.052 2.30184L17.9387 2.18878Z" fill="#999"/>
  </svg>`;
}

// TileBottom Zickzack SVG — identical to TileBottom.jsx pattern!==Halbraute
function tileBottomZickzackSvg(color1: string, color2: string): string {
  return `<svg width="18" height="9" viewBox="0 0 18 9" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 0L9 0L0 9V0Z" fill="${color2}"/>
    <path d="M18 0V9L9 0H18Z" fill="${color2}"/>
    <path d="M9 0L18 9H0L9 0Z" fill="${color1}"/>
    <path d="M17.9387 2.18878L11.1927 8.94494L11.306 9.05799L18.052 2.30184L17.9387 2.18878Z" fill="#32261C"/>
  </svg>`;
}

function toBase64Img(svg: string): string {
  return `<img src="data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}" width="18" height="9" style="display:inline-block;vertical-align:top;" />`;
}

export function buildCarpetHtml(data: CarpetData): string {
  const { width, height, pattern, colors } = data;
  const columns = Math.floor(width / 7);
  const rows = Math.floor(height / 9);
  const defaultColor = "#B1B1B1";
  const defaultColor2 = "#ffffff";

  // Count unique colors
  const uniqueColors = new Set<string>();
  Object.values(colors).forEach((c) => {
    if (c.color1) uniqueColors.add(c.color1);
    if (c.color2) uniqueColors.add(c.color2);
  });

  const now = new Date();
  const dateStr = now.toLocaleDateString("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  let rowsHtml = "";
  for (let i = 1; i <= rows; i++) {
    const topId = `${i}-top`;
    const bottomId = `${i}-bottom`;
    const topColors = colors[topId] ?? {};
    const bottomColors = colors[bottomId] ?? {};

    const topC1 = topColors.color1 || defaultColor;
    const topC2 = topColors.color2 || defaultColor2;
    const botC1 = bottomColors.color1 || defaultColor;
    const botC2 = bottomColors.color2 || defaultColor2;

    let topTiles = "";
    let bottomTiles = "";
    for (let c = 0; c < columns; c++) {
      topTiles += toBase64Img(tileTopSvg(topC1, topC2));
      bottomTiles += toBase64Img(
        pattern === "Halbraute"
          ? tileBottomHalbrauteSvg(botC1, botC2)
          : tileBottomZickzackSvg(botC1, botC2)
      );
    }

    rowsHtml += `
      <div class="row row-top" style="position:relative;line-height:0;font-size:0;">
        <span style="position:absolute;top:2px;left:0;font-size:8px;color:gray;font-family:sans-serif;">${i}</span>
        ${topTiles}
      </div>
      <div class="row row-bottom" style="line-height:0;font-size:0;">
        ${bottomTiles}
      </div>`;
  }

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: sans-serif; font-size: 12px; margin: 20px; }
    h1 { font-size: 16px; color: #333; margin-bottom: 16px; }
    table { border-collapse: collapse; margin-bottom: 20px; }
    td { padding: 3px 12px 3px 0; vertical-align: top; }
    .carpet-preview { margin-top: 16px; }
    .row { display: block; }
    img { display: inline-block; }
    .logo { float: right; width: 68px; }
  </style>
</head>
<body>
  <img class="logo" src="data:image/svg+xml;base64,${TESSANDA_SVG_B64}" width="68" height="100" />
  <h1>Teppichkonfigurator tessanda.ch</h1>
  <table>
    <tr><td><strong>Datum</strong></td><td>${dateStr} Uhr</td></tr>
    <tr><td><strong>Muster</strong></td><td>${pattern}</td></tr>
    <tr><td><strong>Breite</strong></td><td>${width} cm</td></tr>
    <tr><td><strong>Länge</strong></td><td>${height} cm</td></tr>
    <tr><td><strong>Anzahl Farben</strong></td><td>${uniqueColors.size} Farben</td></tr>
  </table>
  <div class="carpet-preview">
    ${rowsHtml}
  </div>
</body>
</html>`;
}
