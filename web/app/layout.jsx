import { Inter as FontSans } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { cn } from '@/lib/utils';

import NavLink from '@/components/navlink';

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
  <header className="border-b">
    <div className="container flex justify-center h-14 items-center">
      <nav className="flex items-center space-x-8">
        {Object.entries(links).map(([url, name]) => (
          <NavLink key={url} href={url}>
            {name}
          </NavLink>
        ))}
      </nav>
    </div>
  </header>
);

const RootLayout = ({ children }) => (
  <html lang="en" className="h-full w-full m-0 p-0">
    <body
      className={cn(
        "h-screen w-screen m-0 p-0 font-sans antialiased bg-neutral-100",
        fontSans.variable
      )}
    >
      <div className="h-screen w-screen p-4">
        <div className="w-full h-full flex flex-col bg-white border rounded-2xl shadow-xl">
          <Header />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
      <div className="w-full h-[20vh] absolute top-0 bg-primary -z-10" />
      <Analytics />
      <SpeedInsights />
    </body>
  </html>
);

export default RootLayout;
