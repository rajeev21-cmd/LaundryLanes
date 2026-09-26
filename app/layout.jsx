import '@/styles/globals.css';
import { AppProvider } from '@/lib/AppProvider';

export const metadata = {
  title: 'Laundrylanes — Dry Cleaning & Laundry, Delivered',
  description:
    'Laundrylanes: dry cleaning, wash & fold, wash & iron, ironing and shoe cleaning with convenient booking, quick delivery and doorstep pickup & drop.',
  manifest: '/manifest.json',
  icons: { icon: '/images/logo.webp', apple: '/images/logo.webp' },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0B2545',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Laundrylanes" />
      </head>
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
