import { Suspense } from 'react';
import { redirect } from 'next/navigation';

import { format, formatDistanceToNow } from 'date-fns';
import { SiMessenger, SiInstagram, SiWhatsapp } from '@icons-pack/react-simple-icons';

import { auth } from '@/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchChatThreads } from '@/lib/data';
import { cn } from '@/lib/utils';
import { ScrollContainer } from '../shared/server';
import { ThreadListEntryLink, ThreadListFilters } from './client';


const SourceIcon = ({ source }) => {
  const className = 'w-[1em] inline';
  if (source === 'facebook') {
    return <SiMessenger className={className} />;
  } else if (source === 'whatsapp') {
    return <SiWhatsapp className={className} />;
  } else if (source === 'instagram') {
    return <SiInstagram className={className} />;
  }

  return <span />;
}


export const ThreadListEntry = ({ thread, isActive }) => (
  <div className={
    cn(
      "rounded-lg py-2 px-3 text-sm space-y-1",
      isActive && "bg-muted",
    )}
  >
    <div className="flex items-center space-x-1">
      <span className={isActive ? 'text-primary' : 'text-muted-foreground'}>
        <SourceIcon source={thread.source} />
      </span>
      <div className="flex flex-1 justify-between items-baseline space-x-1">
        <div className="line-clamp-1 font-semibold">
          {thread.title}
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
      {thread.content
        ? `${thread.authorFirstName}: ${thread.content}`
        : `${thread.authorFirstName} sent a message`}
    </div>
  </div>
);


const ThreadList = async ({ threadId }) => {
  const session = await auth();
  const data = await fetchChatThreads(session.user.id);

  const allThreadIds = new Set(data.map(t => t.threadId));
  if (!allThreadIds.has(threadId)) {
    if (data && data.length) {
      redirect(`chats?id=${data[0].threadId}`);
    } else {
      return <ThreadListSkeleton />;
    }
  }

  return (
    <ScrollContainer>
      {data.map(t => (
        <ThreadListEntryLink
          key={t.threadId}
          thread={t}
          isActive={threadId === t.threadId}
        />
      ))}
    </ScrollContainer>
  )
}


const ThreadListSuspenseContainer = ({ threadId }) => (
  <Suspense fallback={<ThreadListSkeleton />}>
    <ThreadList threadId={threadId} />
  </Suspense>
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


export const ThreadListSkeleton = () => (
  <ScrollContainer>
    {Array(32).fill().map((_, i) => (
      <ThreadListEntrySkeleton key={i} />
    ))}
  </ScrollContainer>
);


export const Sidebar = ({ threadId, skeleton }) => (
  <div className="h-full w-full flex flex-col space-y-2">
    {/* <div className="flex-none">
      <ThreadListFilters />
    </div> */}
    <div className="flex-1 h-0">
      {skeleton
        ? <ThreadListSkeleton />
        : <ThreadListSuspenseContainer threadId={threadId} />}
    </div>
  </div>
);
