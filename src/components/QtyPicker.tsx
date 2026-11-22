"use client";

export function QtyPicker({
  value,
  onChange,
  max,
  label,
  overText,
  availableText,
}: {
  value: number;
  onChange: (n: number) => void;
  /** Null when this item is not limited by stock. */
  max: number | null;
  label: string;
  overText: string;
  availableText?: string;
}) {
  const over = max !== null && value > max;
  return (
    <div style={{ marginTop: 8 }}>
      <label>{label}</label>
      <div className="row" style={{ alignItems: "center", gap: 8 }}>
        <button
          type="button"
          className="btn s o"
          onClick={() => onChange(Math.max(1, value - 1))}
          aria-label="Decrease quantity"
        >
          −
        </button>
        <input
          type="number"
          min={1}
          value={value}
          onChange={(e) => {
            const n = Math.floor(Number(e.target.value));
            onChange(Number.isFinite(n) && n > 0 ? n : 1);
          }}
          style={{ width: 88, textAlign: "center" }}
          aria-label={label}
        />
        <button
          type="button"
          className="btn s o"
          onClick={() => onChange(value + 1)}
          aria-label="Increase quantity"
        >
          +
        </button>
        {max !== null && availableText ? (
          <span className="sm mut">{availableText}</span>
        ) : null}
      </div>
      {over ? <p className="err">{overText}</p> : null}
    </div>
  );
}
