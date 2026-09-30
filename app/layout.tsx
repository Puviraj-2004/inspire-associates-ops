// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import './globals.css';

// Viewport settings for smooth mobile feel
export const viewport: Viewport = {
  themeColor: '#1a2c5b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'Inspire Associates | Daily Work Tracker',
  description: 'Growth | Innovation | Trust - Staff Work Management System',
  applicationName: 'Inspire Tracker',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Inspire Tracker',
  },
  icons: {
    icon: '/icon.png',
    apple: '/icon.png', // iPhone home screen icon
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-slate-900 select-none">
        {children}
      </body>
    </html>
  );
}