'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';


const NavLink = ({ href, children }) => {
  const pathname = usePathname();
  return (
    <Link
      href={href}
      className={cn(
        "text-sm font-medium transition-colors hover:text-primary",
        pathname === href && "text-primary border-primary border-b-2",
      )}
    >
      {children}
    </Link>
  );
}


export default NavLink;
