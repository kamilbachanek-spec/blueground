import { useEffect, useState, useCallback } from 'react';
import type { BannerSize } from '../bannerConfig';

interface RowIndexSelectorProps {
  rowIndex: number;
  onChange: (index: number) => void;
  size: BannerSize;
}

interface RowInfo {
  city: string;
  name: string;
  price: string;
  totalRows: number;
}

/** Parse a single CSV line handling quoted fields. */
function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cur += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        out.push(cur.trim());
        cur = '';
      } else {
        cur += ch;
      }
    }
  }
  out.push(cur.trim());
  return out;
}

/** Parse feed.csv: find headers, count total rows, extract info for one row. */
function getRowInfo(text: string, targetRow: number): RowInfo | null {
  const lines = text.split(/\r?\n/);

  let headerIndex = -1;
  let headers: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (
      line.indexOf('Property name') !== -1 ||
      line.indexOf('property_name') !== -1 ||
      line.indexOf('Property ID') !== -1 ||
      (line.indexOf('city') !== -1 && line.indexOf('title') !== -1)
    ) {
      headers = parseCsvLine(line);
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim()) {
        headers = parseCsvLine(lines[i]);
        headerIndex = i;
        break;
      }
    }
  }

  if (headerIndex === -1) return null;

  const nameIdx = headers.findIndex(
    (h) => h === 'Property name' || h === 'property_name' || h === 'title'
  );
  const cityIdx = headers.findIndex(
    (h) => h === 'Destination name' || h === 'city'
  );
  const priceIdx = headers.findIndex(
    (h) => h === 'Formatted price' || h === 'Price' || h === 'price' || h === 'nightly_price'
  );

  let rowNum = 0;
  let totalRows = 0;
  let targetValues: string[] | null = null;

  for (let j = headerIndex + 1; j < lines.length; j++) {
    const raw = lines[j].trim();
    if (!raw) continue;
    const values = parseCsvLine(raw);
    if (values.length < 2) continue;

    if (rowNum === targetRow) {
      targetValues = values;
    }
    rowNum++;
    totalRows++;
  }

  if (!targetValues) return { city: '—', name: '—', price: '—', totalRows };

  return {
    city: (cityIdx >= 0 ? targetValues[cityIdx] : '') || '—',
    name: (nameIdx >= 0 ? targetValues[nameIdx] : '') || '—',
    price: (priceIdx >= 0 ? targetValues[priceIdx] : '') || '—',
    totalRows,
  };
}

export default function RowIndexSelector({ rowIndex, onChange, size }: RowIndexSelectorProps) {
  const [rowInfo, setRowInfo] = useState<RowInfo | null>(null);
  const [csvText, setCsvText] = useState<string>('');

  // Fetch feed.csv when banner size changes
  useEffect(() => {
    const csvUrl = size.path.replace('index.html', 'feed.csv');
    fetch(csvUrl)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load feed.csv');
        return res.text();
      })
      .then((text) => setCsvText(text))
      .catch((err) => {
        console.error('Could not load feed.csv:', err);
        setCsvText('');
        setRowInfo(null);
      });
  }, [size.path]);

  // Update row info when csvText or rowIndex changes
  useEffect(() => {
    if (!csvText) {
      setRowInfo(null);
      return;
    }
    const info = getRowInfo(csvText, rowIndex);
    setRowInfo(info);
  }, [csvText, rowIndex]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value, 10);
      onChange(isNaN(val) ? 0 : Math.max(0, val));
    },
    [onChange]
  );

  return (
    <div className="control-group row-selector">
      <label htmlFor="row-index">
        CSV Row{rowInfo ? ` (${rowInfo.totalRows} total)` : ''}
      </label>
      <input
        id="row-index"
        type="number"
        min={0}
        max={rowInfo ? rowInfo.totalRows - 1 : undefined}
        value={rowIndex}
        onChange={handleChange}
      />
      {rowInfo && (
        <div className="row-info">
          <span className="row-info-city">{rowInfo.city}</span>
          <span className="row-info-sep"> — </span>
          <span className="row-info-name">{rowInfo.name}</span>
          <span className="row-info-sep"> — </span>
          <span className="row-info-price">{rowInfo.price}</span>
        </div>
      )}
    </div>
  );
}
