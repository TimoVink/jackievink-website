import { Suspense } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { format, formatDistanceToNow } from 'date-fns';

import { Spinner } from '@/components/ui/spinner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

import { auth } from '@/auth';

import { fetchEmailThreads } from '@/lib/data';
import { cn } from '@/lib/utils';

import { ThreadEntries } from './components-client';


export const Loading = () => (
  <div className="h-full w-full flex flex-col justify-center">
    <div className="w-full flex justify-center">
      <Spinner />
    </div>
  </div>
);

export const Card = ({ id, className, children }) => (
  <div id={id} className={cn("rounded-2xl bg-white shadow-md", className)}>
    {children}
  </div>
);


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


export const ThreadListEntry = ({ thread, isActive }) => (
  <Link
    key={thread.threadId}
    id={`thread-${thread.threadId}`}
    className={cn(
      "block rounded-lg py-2 px-3 text-sm space-y-1",
      isActive && "bg-muted",
    )}
    href={`/emails?id=${thread.threadId}`}
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
  </Link>
);


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


export const ThreadListScrollContainer = ({ children, holdPadding }) => (
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
    <Card className="h-full">
      <ThreadListScrollContainer>
        {data.map(t => (
          <ThreadListEntry
            key={t.threadId}
            thread={t}
            isActive={threadId === t.threadId}
          />
        ))}
      </ThreadListScrollContainer>
    </Card>
  )
};


export const ThreadListSkeleton = () => (
  <Card className="h-full">
    <ThreadListScrollContainer>
      {Array(32).fill().map((_, i) => (
        <ThreadListEntrySkeleton key={i} />
      ))}
    </ThreadListScrollContainer>
  </Card>
);


export const ThreadListSuspenseContainer = ({ threadId }) => (
  <Suspense fallback={<ThreadListSkeleton />}>
    <ThreadList threadId={threadId} />
  </Suspense>
);


export const ThreadEntriesSkeleton = () => (
  <Loading />
);


export const ThreadEntriesSuspenseContainer = ({ threadId }) => (
  <Suspense key={threadId} fallback={<ThreadEntriesSkeleton />}>
    <ThreadEntries />
  </Suspense>
);


export const Layout = ({ listComponent, detailComponent }) => (
  <div className="h-full flex bg-muted">
    <div className="flex-none w-[28rem] p-4 pr-2">
      {listComponent}
    </div>
    <div className="flex-1">
      {detailComponent}
    </div>
  </div>
);
