// app/manifest.ts
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Inspire Associates Tracker',
    short_name: 'Inspire Tracker',
    description: 'Staff Daily Work Tracker - Inspire Associates',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1a2c5b', // Inspire Navy Brand Color
    orientation: 'portrait',
    icons: [
      {
        src: '/logo.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}