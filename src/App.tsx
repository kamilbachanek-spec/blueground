import { useState, useCallback } from 'react';
import { BANNER_SIZES } from './bannerConfig';

export default function App() {
  const [refreshKey, setRefreshKey] = useState(Date.now());
  const rowIndex = 0;

  const handleRefresh = useCallback(() => {
    setRefreshKey(Date.now());
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Blueground Banner Overview</h1>
        <button className="refresh-btn header-refresh" onClick={handleRefresh}>
          Refresh All
        </button>
      </header>

      <main className="overview-grid">
        {BANNER_SIZES.map((size) => (
          <div key={size.id} className="overview-item">
            <div className="overview-label">{size.label}</div>
            <div className="overview-banner">
              <iframe
                src={`${size.path}?rowIndex=${rowIndex}&_t=${refreshKey}`}
                width={size.width}
                height={size.height}
                title={`Banner ${size.label}`}
                style={{
                  border: '1px solid #ccc',
                  background: '#fff',
                  display: 'block',
                }}
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
