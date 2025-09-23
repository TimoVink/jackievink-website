'use client';


import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

import { Input } from '@/components/ui/input';
import { MyCard } from '../shared/server';
import { ThreadListEntry } from './server';


export const ThreadListEntryLink = ({ thread, isActive }) => {
  const pathname = usePathname();
  const params = Object.fromEntries(useSearchParams());

  return (
    <Link
      id={`thread-${thread.threadId}`}
      className="block"
      href={{
        pathname: pathname,
        query: { ...params, id: thread.threadId },
      }}
    >
      <ThreadListEntry isActive={isActive} thread={thread} />
    </Link>
  )
}


export const ThreadListFilters = () => {
  const pathname = usePathname();
  const params = useSearchParams();

  return (
    <MyCard className="p-2">
      <Input />
    </MyCard>
  )
}
