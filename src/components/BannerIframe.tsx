import { useEffect, useRef } from 'react';
import type { BannerSize } from '../bannerConfig';

interface BannerIframeProps {
  size: BannerSize;
  rowIndex: number;
  refreshKey: number;
  onLoadStart: () => void;
  onLoadEnd: () => void;
}

export default function BannerIframe({ size, rowIndex, refreshKey, onLoadStart, onLoadEnd }: BannerIframeProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const bannerUrl = `${size.path}?rowIndex=${rowIndex}&_t=${refreshKey}`;

  useEffect(() => {
    onLoadStart();
  }, [bannerUrl, onLoadStart]);

  return (
    <div className="banner-iframe-wrapper">
      <iframe
        ref={iframeRef}
        key={`${refreshKey}-${rowIndex}`}
        src={bannerUrl}
        width={size.width}
        height={size.height}
        title={`Banner preview ${size.label}`}
        style={{
          border: '1px solid #ccc',
          background: '#fff',
          display: 'block',
        }}
        onLoad={onLoadEnd}
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}
