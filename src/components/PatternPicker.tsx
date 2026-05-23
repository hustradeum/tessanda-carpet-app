interface Props {
  activePattern: string;
  handlePatternChange: (pattern: string) => void;
}

export default function PatternPicker({ activePattern, handlePatternChange }: Props) {
  return (
    <div className="pattern-picker">
      <div className="pattern-picker__title">Muster</div>
      <div className="pattern-picker__patterns">
        <label htmlFor="pattern-halbraute">
          <input
            type="radio"
            id="pattern-halbraute"
            name="pattern"
            value="Halbraute"
            checked={activePattern === "Halbraute"}
            onChange={(e) => handlePatternChange(e.target.value)}
          />
          <span>Halbraute</span>
        </label>
        <label htmlFor="pattern-zickzack">
          <input
            type="radio"
            id="pattern-zickzack"
            name="pattern"
            value="Zickzack"
            checked={activePattern === "Zickzack"}
            onChange={(e) => handlePatternChange(e.target.value)}
          />
          <span>Zickzack</span>
        </label>
      </div>
    </div>
  );
}
