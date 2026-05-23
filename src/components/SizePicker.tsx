interface Props {
  width: number;
  height: number;
  tileWidth: number;
  tileHeight: number;
  handleWidthChange: (name: string, value: string) => void;
  handleHeightChange: (name: string, value: string) => void;
}

export default function SizePicker({
  width,
  height,
  tileWidth,
  tileHeight,
  handleWidthChange,
  handleHeightChange,
}: Props) {
  return (
    <div className="size-picker">
      <div className="size-picker__title">Grösse</div>
      <div className="size-picker__sizes">
        <label htmlFor="width">
          <span className="size-input-label">Breite</span>
          <input
            type="number"
            id="width"
            name="width"
            value={width}
            step={tileWidth}
            min="70"
            max="175"
            onChange={(e) => handleWidthChange(e.target.name, e.target.value)}
          />
          <span className="size-input-unit">cm</span>
        </label>
        <label htmlFor="height">
          <span className="size-input-label">Länge</span>
          <input
            type="number"
            id="height"
            name="height"
            value={height}
            step={tileHeight}
            min="90"
            max="380"
            onChange={(e) => handleHeightChange(e.target.name, e.target.value)}
          />
          <span className="size-input-unit">cm</span>
        </label>
      </div>
    </div>
  );
}
