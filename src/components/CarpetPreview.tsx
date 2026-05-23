import { useState } from "react";
import TileTop from "./TileTop.js";
import TileBottom from "./TileBottom.js";

export interface ColorEntry {
  row: string;
  color1?: string;
  color2?: string;
}

interface Props {
  width: number;
  height: number;
  tileWidth: number;
  tileHeight: number;
  pattern: string;
  colors: Record<string, ColorEntry>;
  handleRowSelection: (row: string) => void;
}

export default function CarpetPreview({
  width,
  height,
  tileWidth,
  tileHeight,
  pattern,
  colors,
  handleRowSelection,
}: Props) {
  const [activeRow, setActiveRow] = useState("");

  const onRowSelection = (row: string) => {
    setActiveRow(row);
    handleRowSelection(row);
  };

  const columns = Math.floor(width / tileWidth);
  const rows = Math.floor(height / tileHeight);

  return (
    <>
      {Array.from({ length: rows }, (_, idx) => {
        const rowNumber = idx + 1;
        const topId = `${rowNumber}-top`;
        const bottomId = `${rowNumber}-bottom`;

        const topColors = colors[topId] ?? {};
        const bottomColors = colors[bottomId] ?? {};

        return (
          <div key={rowNumber}>
            <div
              id={`row-${rowNumber}-top`}
              className={activeRow === topId ? "row row-top is-active" : "row row-top"}
              role="button"
              tabIndex={-1}
              data-id={topId}
              onClick={(e) => onRowSelection((e.currentTarget as HTMLElement).dataset.id!)}
              onKeyDown={(e) => onRowSelection((e.currentTarget as HTMLElement).dataset.id!)}
            >
              {Array.from({ length: columns }, (_, i) => (
                <TileTop key={i} color1={topColors.color1} color2={topColors.color2} />
              ))}
              <span className="row-number row-number-left">{rowNumber}</span>
              <span className="row-number row-number-right">{rowNumber}</span>
            </div>
            <div
              id={`row-${rowNumber}-bottom`}
              className={activeRow === bottomId ? "row row-bottom is-active" : "row row-bottom"}
              role="button"
              tabIndex={-1}
              data-id={bottomId}
              onClick={(e) => onRowSelection((e.currentTarget as HTMLElement).dataset.id!)}
              onKeyDown={(e) => onRowSelection((e.currentTarget as HTMLElement).dataset.id!)}
            >
              {Array.from({ length: columns }, (_, i) => (
                <TileBottom
                  key={i}
                  color1={bottomColors.color1}
                  color2={bottomColors.color2}
                  pattern={pattern}
                />
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}
