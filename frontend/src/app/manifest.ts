import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Fashion Ecom — Thoi trang nam cao cap',
    short_name: 'FashionEcom',
    description: 'Mua sam thoi trang nam chinh hang, giao hang toan quoc',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1a1a1a',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
