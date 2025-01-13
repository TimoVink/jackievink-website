import { Suspense } from 'react';
import { redirect } from 'next/navigation';

import { format, formatDistanceToNow } from 'date-fns';

import { auth } from '@/auth';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchEmailThreads } from '@/lib/data';
import { cn } from '@/lib/utils';
import { MyCard } from '../shared/server';
import { ThreadListEntryLink } from './client';


export const ThreadListEntry = ({ thread, isActive }) => (
  <div className={
    cn(
      "rounded-lg py-2 px-3 text-sm space-y-1",
      isActive && "bg-muted",
    )}
  >
    <div className="flex items-center space-x-1">
      <div className="flex flex-1 justify-between items-baseline space-x-1">
        <div className="line-clamp-1 font-semibold">
          {thread.subject}
        </div>
        <div className="flex-none text-xs text-muted-foreground">
          <time
            dateTime={thread.timestamp}
            title={format(thread.timestamp, 'EEEE, MMMM d, yyyy @ h:mm a')}
            suppressHydrationWarning={true}
          >
            {formatDistanceToNow(thread.timestamp, { addSuffix: true })}
          </time>
        </div>
      </div>
    </div>
    <div className="line-clamp-1 text-xs text-muted-foreground">
      {thread.preview
        ? `${thread.authorFirstName}: ${thread.preview}`
        : `${thread.authorFirstName} sent an email`}
    </div>
  </div>
);


const ThreadListScrollContainer = ({ children, holdPadding }) => (
  <div className="py-4 px-1 h-full">
    <ScrollArea>
      <div className={cn(
        "space-y-2 h-full",
        !holdPadding && 'px-3'
      )}>
        {children}
      </div>
    </ScrollArea>
  </div>
);


const ThreadList = async ({ threadId }) => {
  const session = await auth();
  const data = await fetchEmailThreads(session.user.id);

  const allThreadIds = new Set(data.map(t => t.threadId));
  if (!allThreadIds.has(threadId)) {
    if (data && data.length) {
      redirect(`emails?id=${data[0].threadId}`);
    } else {
      return <ThreadListSkeleton />;
    }
  }

  return (
    <MyCard className="h-full">
      <ThreadListScrollContainer>
        {data.map(t => (
          <ThreadListEntryLink
            key={t.threadId}
            thread={t}
            isActive={threadId === t.threadId}
          />
        ))}
      </ThreadListScrollContainer>
    </MyCard>
  )
};


const ThreadListEntrySkeleton = () => (
  <div className="block rounded-lg py-2 px-3 space-y-1">
    <div className="flex items-center space-x-1">
      <Skeleton className="h-[1lh] w-[1lh] rounded-full" />
      <Skeleton className="h-[1lh] w-full" />
    </div>
    <div className="line-clamp-1 text-xs text-muted-foreground">
      <Skeleton className="h-[1lh] w-full" />
    </div>
  </div>
);


const ThreadListSkeleton = () => (
  <MyCard className="h-full">
    <ThreadListScrollContainer>
      {Array(32).fill().map((_, i) => (
        <ThreadListEntrySkeleton key={i} />
      ))}
    </ThreadListScrollContainer>
  </MyCard>
);


const ThreadListSuspenseContainer = ({ threadId }) => (
  <Suspense fallback={<ThreadListSkeleton />}>
    <ThreadList threadId={threadId} />
  </Suspense>
);


export const Sidebar = ({ threadId, skeleton }) => (
  <div className="h-full w-full">
    {skeleton
      ? <ThreadListSkeleton />
      : <ThreadListSuspenseContainer threadId={threadId} />}
  </div>
);
