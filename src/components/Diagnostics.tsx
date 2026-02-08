import type { BannerSize } from '../bannerConfig';

export interface LoadLogEntry {
  sizeId: string;
  rowIndex: number;
  loadTimeMs: number;
  timestamp: string;
}

interface DiagnosticsProps {
  size: BannerSize;
  rowIndex: number;
  bannerUrl: string;
  loadTimeMs: number | null;
  log: LoadLogEntry[];
}

export default function Diagnostics({ size, rowIndex, bannerUrl, loadTimeMs, log }: DiagnosticsProps) {
  return (
    <div className="diagnostics">
      <h3>Diagnostics</h3>
      <table>
        <tbody>
          <tr><td>Size ID</td><td>{size.id}</td></tr>
          <tr><td>Label</td><td>{size.label}</td></tr>
          <tr><td>Dimensions</td><td>{size.width} × {size.height}</td></tr>
          <tr><td>Row Index</td><td>{rowIndex}</td></tr>
          <tr><td>Banner URL</td><td className="mono">{bannerUrl}</td></tr>
          <tr>
            <td>Load Time</td>
            <td>{loadTimeMs !== null ? `${loadTimeMs} ms` : 'Loading...'}</td>
          </tr>
        </tbody>
      </table>

      {log.length > 0 && (
        <>
          <h4>Reload Log (last 10)</h4>
          <table className="log-table">
            <thead>
              <tr><th>Time</th><th>Size</th><th>Row</th><th>Load</th></tr>
            </thead>
            <tbody>
              {log.slice(-10).reverse().map((entry, i) => (
                <tr key={i}>
                  <td>{entry.timestamp}</td>
                  <td>{entry.sizeId}</td>
                  <td>{entry.rowIndex}</td>
                  <td>{entry.loadTimeMs} ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
