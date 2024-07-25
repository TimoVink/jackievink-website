import { Inter as FontSans } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { cn } from '@/lib/utils';

import './globals.css';


const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata = {
  title: 'Jackie Vink',
  description: 'Remembering Jacqueline Elizabeth Vink',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full w-full m-0 p-0">
      <body
        className={cn(
          "min-h-screen h-full w-full m-0 p-0 bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
