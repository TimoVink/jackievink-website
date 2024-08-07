import { Suspense } from 'react';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';

import { Spinner } from '@/components/ui/spinner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

import { cn } from '@/lib/utils';

import { ThreadEntries, ThreadList } from './components-client';
import { auth } from '@/auth';


export const Loading = () => (
  <div className="h-full w-full flex flex-col justify-center">
    <div className="w-full flex justify-center">
      <Spinner />
    </div>
  </div>
);

export const Card = ({ className, children }) => (
  <div className={cn("rounded-2xl bg-white h-full shadow-md", className)}>
    {children}
  </div>
);


const cleanAuthor = (author) => {
  const firstName = author.split(/[\.\-]/)[0];
  return `${firstName[0].toUpperCase()}${firstName.substring(1)}`;
}


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
          {thread.title}
        </div>
        <div className="flex-none text-xs text-muted-foreground">
          <time dateTime={thread.timestamp} title={format(thread.timestamp, 'EEEE, MMMM d, yyyy @ h:mm a')}>
            {formatDistanceToNow(thread.timestamp, { addSuffix: true })}
          </time>
        </div>
      </div>
    </div>
    <div className="line-clamp-1 text-xs text-muted-foreground">
      {thread.content
        ? `${cleanAuthor(thread.author)}: ${thread.content}`
        : `${cleanAuthor(thread.author)} sent a message`}
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


export const ScrollContainer = ({ children, holdPadding }) => (
  <Card>
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
  </Card>
);


export const ThreadListSkeleton = () => (
  <ScrollContainer>
    {Array(32).fill().map((_, i) => (
      <ThreadListEntrySkeleton key={i} />
    ))}
  </ScrollContainer>
);


export const ThreadListSuspenseContainer = ({ threadId }) => (
  <Suspense fallback={<ThreadListSkeleton />}>
    <ThreadList threadId={threadId} />
  </Suspense>
);


export const ThreadEntriesSkeleton = () => (
  <ScrollContainer>
    <Loading />
  </ScrollContainer>
);


export const ThreadEntriesSuspenseContainer = async ({ threadId }) => {
  const session = await auth();
  return (
    <Suspense key={threadId} fallback={<ThreadEntriesSkeleton />}>
      <ThreadEntries userId={session.user.id} />
    </Suspense>
  );
}


export const Layout = ({ listComponent, detailComponent }) => (
  <div className="h-full flex bg-muted">
    <div className="flex-none w-[28rem] p-4 pr-2">
      {listComponent}
    </div>
    <div className="flex-1 p-4 pl-2">
      {detailComponent}
    </div>
  </div>
);
