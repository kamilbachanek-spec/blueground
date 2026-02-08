/** Viewport preset selector for the Blueground page iframe.
 *  Adjusts the iframe container width to simulate different devices.
 *  Extend VIEWPORT_PRESETS to add more device widths. */

export interface ViewportPreset {
  label: string;
  width: number | null; // null = fill available space
}

export const VIEWPORT_PRESETS: ViewportPreset[] = [
  { label: 'Desktop', width: 1200 },
  { label: 'Tablet', width: 768 },
  { label: 'Mobile', width: 375 },
  { label: 'Auto', width: null },
];

interface ViewportPresetsProps {
  selected: ViewportPreset;
  onChange: (preset: ViewportPreset) => void;
}

export default function ViewportPresets({ selected, onChange }: ViewportPresetsProps) {
  return (
    <div className="control-group">
      <label>Page Viewport</label>
      <div className="viewport-buttons">
        {VIEWPORT_PRESETS.map((p) => (
          <button
            key={p.label}
            className={selected.label === p.label ? 'active' : ''}
            onClick={() => onChange(p)}
          >
            {p.label}
            {p.width ? ` (${p.width}px)` : ''}
          </button>
        ))}
      </div>
    </div>
  );
}
