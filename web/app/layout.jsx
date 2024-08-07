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

const RootLayout = ({ children }) => (
  <html lang="en" className="h-full w-full m-0 p-0">
    <body
      className={cn(
        "h-screen w-screen m-0 p-0 font-sans antialiased bg-neutral-100",
        fontSans.variable
      )}
    >
      <div className="h-screen w-screen p-4">
        {children}
      </div>
      <Analytics />
      <SpeedInsights />
    </body>
  </html>
);


export default RootLayout;
