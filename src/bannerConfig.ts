export interface BannerSize {
  id: string;
  label: string;
  width: number;
  height: number;
  path: string;
}

export const BANNER_SIZES: BannerSize[] = [
  { id: '160x600', label: '160 × 600', width: 160, height: 600, path: '/banners/160x600/index.html' },
  { id: '300x250', label: '300 × 250', width: 300, height: 250, path: '/banners/300x250/index.html' },
  { id: '300x600', label: '300 × 600', width: 300, height: 600, path: '/banners/300x600/index.html' },
  { id: '320x100', label: '320 × 100', width: 320, height: 100, path: '/banners/320x100/index.html' },
  { id: '336x280', label: '336 × 280', width: 336, height: 280, path: '/banners/336x280/index.html' },
  { id: '728x90',  label: '728 × 90',  width: 728, height: 90,  path: '/banners/728x90/index.html' },
  { id: '970x250', label: '970 × 250', width: 970, height: 250, path: '/banners/970x250/index.html' },
];
