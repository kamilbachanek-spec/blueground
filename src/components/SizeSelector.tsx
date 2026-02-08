import { BANNER_SIZES, type BannerSize } from '../bannerConfig';

interface SizeSelectorProps {
  selected: BannerSize;
  onChange: (size: BannerSize) => void;
}

export default function SizeSelector({ selected, onChange }: SizeSelectorProps) {
  return (
    <div className="control-group">
      <label htmlFor="size-select">Banner Size</label>
      <select
        id="size-select"
        value={selected.id}
        onChange={(e) => {
          const size = BANNER_SIZES.find((s) => s.id === e.target.value);
          if (size) onChange(size);
        }}
      >
        {BANNER_SIZES.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}
