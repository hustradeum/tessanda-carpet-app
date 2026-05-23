import Colors from "../data/colors.json";

interface Props {
  title: string;
  type: "color1" | "color2";
  activeColor: string;
  handleColorChange: (color: string, type: "color1" | "color2") => void;
}

export default function ColorPicker({ title, type, activeColor, handleColorChange }: Props) {
  return (
    <div className="color-picker">
      {title && <div className="color-picker__title">{title}</div>}
      <div className="color-picker__colors">
        {Object.entries(Colors).map(([key, value]) => (
          <button
            type="button"
            className={activeColor === value ? "color-button is-active-color" : "color-button"}
            key={key}
            style={{ backgroundColor: value }}
            aria-label="Farbe wählen"
            value={value}
            onClick={(e) => handleColorChange((e.target as HTMLButtonElement).value, type)}
          />
        ))}
      </div>
    </div>
  );
}
