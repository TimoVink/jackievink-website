import Link from "next/link"
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

const links = {
  '/chats': 'Chats',
  '/email': 'Email',
  '/files': 'Files',
  '/media': 'Media',
}

const Header = () => (
  <header className="sticky top-0 z-50 w-full border-b bg-white">
    <div className="container flex justify-center h-14 max-w-screen-2xl items-center">
      <nav className="flex items-center space-x-4 lg:space-x-6">
        {Object.entries(links).map(([url, name]) => (
          <Link
            key={url}
            href={url}
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            {name}
          </Link>
        ))}
      </nav>
    </div>
  </header>
);

const RootLayout = ({ children }) => (
  <html lang="en" className="h-full w-full m-0 p-0">
    <body
      className={cn(
        "min-h-screen h-full w-full m-0 p-0 bg-background font-sans antialiased",
        fontSans.variable
      )}
    >
      <div className="h-full flex flex-col">
        <Header />
        <main className="h-full">
          {children}
        </main>
      </div>
      <Analytics />
      <SpeedInsights />
    </body>
  </html>
);

export default RootLayout;
