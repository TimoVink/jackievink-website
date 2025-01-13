import { Suspense } from 'react';

import { Loading } from '@/components/loading';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ThreadEntries } from './client';
import { cn } from '@/lib/utils';


export const ThreadEntryScrollContainer = ({ children }) => (
  <div className="h-full p-1">
    <ScrollArea>
      <div className={cn(
        "space-y-4 pl-1 py-3 pr-4",
      )}>
        {children}
      </div>
    </ScrollArea>
  </div>
);


export const ThreadEntriesSkeleton = () => (
  <Loading />
);


const ThreadEntriesSuspenseContainer = ({ threadId }) => (
  <Suspense key={threadId} fallback={<ThreadEntriesSkeleton />}>
    <ThreadEntries threadId={threadId} />
  </Suspense>
);


export const Main = ({ threadId, skeleton }) => (
  <div className="h-full w-full">
    {skeleton
      ? <ThreadEntriesSkeleton />
      : <ThreadEntriesSuspenseContainer threadId={threadId} />}
  </div>
);
