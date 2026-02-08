interface RowIndexSelectorProps {
  rowIndex: number;
  onChange: (index: number) => void;
}

export default function RowIndexSelector({ rowIndex, onChange }: RowIndexSelectorProps) {
  return (
    <div className="control-group">
      <label htmlFor="row-index">CSV Row Index</label>
      <input
        id="row-index"
        type="number"
        min={0}
        value={rowIndex}
        onChange={(e) => onChange(Math.max(0, parseInt(e.target.value, 10) || 0))}
      />
    </div>
  );
}
