import { useState, useCallback, useEffect, useRef } from 'react';
import { BANNER_SIZES, type BannerSize } from './bannerConfig';
import SizeSelector from './components/SizeSelector';
import BannerIframe from './components/BannerIframe';
import Diagnostics, { type LoadLogEntry } from './components/Diagnostics';

export default function App() {
  const [selectedSize, setSelectedSize] = useState<BannerSize>(BANNER_SIZES[0]);
  const [refreshKey, setRefreshKey] = useState(Date.now());
  const rowIndex = 0;

  // Load timing
  const loadStartRef = useRef<number>(0);
  const [loadTimeMs, setLoadTimeMs] = useState<number | null>(null);
  const [log, setLog] = useState<LoadLogEntry[]>([]);

  const bannerUrl = `${selectedSize.path}?rowIndex=${rowIndex}&_t=${refreshKey}`;

  const handleRefresh = useCallback(() => {
    setRefreshKey(Date.now());
  }, []);

  const handleLoadStart = useCallback(() => {
    loadStartRef.current = performance.now();
    setLoadTimeMs(null);
  }, []);

  const handleLoadEnd = useCallback(() => {
    const duration = Math.round(performance.now() - loadStartRef.current);
    setLoadTimeMs(duration);
    setLog((prev) => [
      ...prev,
      {
        sizeId: selectedSize.id,
        rowIndex,
        loadTimeMs: duration,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  }, [selectedSize.id, rowIndex]);

  /* ── Keyboard shortcuts ──────────────────────────────────────────────
   *  R         → refresh banner
   *  ArrowLeft → previous banner size
   *  ArrowRight→ next banner size
   *  Shortcuts are disabled when an input/select/textarea is focused.
   * ───────────────────────────────────────────────────────────────────*/
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;

      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleRefresh();
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setSelectedSize((prev) => {
          const idx = BANNER_SIZES.findIndex((s) => s.id === prev.id);
          return BANNER_SIZES[(idx - 1 + BANNER_SIZES.length) % BANNER_SIZES.length];
        });
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setSelectedSize((prev) => {
          const idx = BANNER_SIZES.findIndex((s) => s.id === prev.id);
          return BANNER_SIZES[(idx + 1) % BANNER_SIZES.length];
        });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleRefresh]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Blueground Banner Preview</h1>
        <span className="shortcut-hint">
          Shortcuts: <kbd>R</kbd> refresh &middot; <kbd>&larr;</kbd><kbd>&rarr;</kbd> cycle sizes
        </span>
      </header>

      <main className="app-main-centered">
        <div className="controls-card">
          <SizeSelector selected={selectedSize} onChange={setSelectedSize} />
          <button className="refresh-btn" onClick={handleRefresh}>
            Refresh Banner
          </button>
        </div>

        <div className="banner-card">
          <BannerIframe
            size={selectedSize}
            rowIndex={rowIndex}
            refreshKey={refreshKey}
            onLoadStart={handleLoadStart}
            onLoadEnd={handleLoadEnd}
          />
        </div>

        <Diagnostics
          size={selectedSize}
          rowIndex={rowIndex}
          bannerUrl={bannerUrl}
          loadTimeMs={loadTimeMs}
          log={log}
        />
      </main>
    </div>
  );
}
