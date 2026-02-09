import { useEffect, useState } from 'react';
import type { BannerSize } from '../bannerConfig';

export interface CsvRow {
  index: number;
  label: string;
}

interface RowIndexSelectorProps {
  rowIndex: number;
  onChange: (index: number) => void;
  size: BannerSize;
}

/** Parse the banner's feed.csv to extract row labels for the dropdown. */
function parseFeedCsv(text: string): CsvRow[] {
  const lines = text.split(/\r?\n/);
  const rows: CsvRow[] = [];

  // Find the header line (look for known columns like "Property name" or "property_name")
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

  // Fallback: use first non-empty line as header
  if (headerIndex === -1) {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim()) {
        headers = parseCsvLine(lines[i]);
        headerIndex = i;
        break;
      }
    }
  }

  if (headerIndex === -1) return rows;

  // Find column indices for display
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
  for (let j = headerIndex + 1; j < lines.length; j++) {
    const raw = lines[j].trim();
    if (!raw) continue;
    const values = parseCsvLine(raw);
    if (values.length < 2) continue;

    // Build a readable label
    const parts: string[] = [];
    if (cityIdx >= 0 && values[cityIdx]) parts.push(values[cityIdx]);
    if (nameIdx >= 0 && values[nameIdx]) parts.push(values[nameIdx]);
    if (priceIdx >= 0 && values[priceIdx]) parts.push(values[priceIdx]);

    const label = parts.length > 0
      ? `Row ${rowNum}: ${parts.join(' – ')}`
      : `Row ${rowNum}`;

    rows.push({ index: rowNum, label });
    rowNum++;
  }

  return rows;
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

export default function RowIndexSelector({ rowIndex, onChange, size }: RowIndexSelectorProps) {
  const [csvRows, setCsvRows] = useState<CsvRow[]>([]);

  // Fetch feed.csv whenever banner size changes
  useEffect(() => {
    const csvUrl = size.path.replace('index.html', 'feed.csv');
    fetch(csvUrl)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load feed.csv');
        return res.text();
      })
      .then((text) => {
        const rows = parseFeedCsv(text);
        setCsvRows(rows);
      })
      .catch((err) => {
        console.error('Could not load feed.csv:', err);
        setCsvRows([]);
      });
  }, [size.path]);

  return (
    <div className="control-group row-selector">
      <label htmlFor="row-index">
        CSV Row ({csvRows.length} properties)
      </label>
      {csvRows.length > 0 ? (
        <select
          id="row-index"
          value={rowIndex}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
        >
          {csvRows.map((row) => (
            <option key={row.index} value={row.index}>
              {row.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id="row-index"
          type="number"
          min={0}
          value={rowIndex}
          onChange={(e) => onChange(Math.max(0, parseInt(e.target.value, 10) || 0))}
        />
      )}
    </div>
  );
}
