import { format, formatDistanceToNow } from 'date-fns';
import { SiMessenger, SiInstagram, SiWhatsapp } from '@icons-pack/react-simple-icons';
import Link from 'next/link';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from "@/components/ui/skeleton"
import { fetchEntries, fetchThreads } from '@/lib/data';
import { emojify } from '@/lib/emoji';
import { cn } from '@/lib/utils';
import { Suspense } from 'react';
import Spinner from '@/components/ui/spinner';


const USER = 'timo.vink';


const SourceIcon = ({ source }) => {
  const className = 'w-[1em] inline text-muted-foreground';
  if (source === 'facebook') {
    return <SiMessenger className={className} />;
  } else if (source === 'whatsapp') {
    return <SiWhatsapp className={className} />;
  } else if (source === 'instagram') {
    return <SiInstagram className={className} />;
  }

  return <span />;
}

const ThreadListEntrySkeleton = () => (
  <div className="block border rounded-lg py-2 px-3 space-y-1">
    <div className="flex items-center space-x-1">
      <Skeleton className="h-[1lh] w-[1lh] rounded-full" />
      <Skeleton className="h-[1lh] w-full" />
    </div>
    <div className="line-clamp-1 text-xs text-muted-foreground">
      <Skeleton className="h-[1lh] w-full" />
    </div>
  </div>
);

const ThreadListEntry = ({ thread, isActive }) => (
  <Link
    key={thread.threadId}
    id={`thread-${thread.threadId}`}
    className="block border rounded-lg py-2 px-3 text-sm space-y-1"
    href={`/chats/${thread.threadId}`}
  >
    <div className="flex items-center space-x-1">
      <SourceIcon source={thread.source} />
      <div className="flex flex-1 justify-between items-baseline space-x-1">
        <div className="line-clamp-1 font-semibold">
          {thread.title}
        </div>
        <div className="flex-none text-xs text-muted-foreground">
          <time datetime={thread.timestamp} title={format(thread.timestamp, 'EEEE, MMMM q, yyyy @ h:mm a')}>
            {formatDistanceToNow(thread.timestamp, { addSuffix: true })}
          </time>
        </div>
      </div>
    </div>
    <div className="line-clamp-1 text-xs text-muted-foreground">
      {thread.content
        ? `${thread.author}: ${thread.content}`
        : `${thread.author} sent a message`}
    </div>
  </Link>
);

const ThreadListSkeleton = () => (
  <ScrollArea className="w-[28rem] border-r">
    <div className="p-4 space-y-2">
      {Array(32).fill().map((_, i) => (
        <ThreadListEntrySkeleton key={i} />
      ))}
    </div>
  </ScrollArea>
)

const ThreadList = async ({ threadId }) => {
  const threads = await fetchThreads('instant-message', USER);
  return (
    <ScrollArea className="w-[28rem] border-r">
      <div className="p-4 space-y-2">
        {threads.map(t => (
          <ThreadListEntry
            key={t.threadId}
            thread={t}
            isActive={threadId === t.threadId}
          />
        ))}
      </div>
    </ScrollArea>
  );
}

const ThreadListContainer = ({ threadId }) => (
  <Suspense fallback={<ThreadListSkeleton />}>
    <ThreadList threadId={threadId} />
  </Suspense>
);


const ThreadEntry = ({ entry }) => (
  <div className={cn(
    'w-full flex text-md',
    entry.author === USER ? 'justify-end' : 'justify-start'
  )}>
    <div className={cn(
      'max-w-[36rem] rounded-2xl px-4 py-2 break-words',
      entry.author === USER ? 'bg-primary' : 'bg-muted',
      entry.author === USER ? 'text-primary-foreground' : 'bg-muted',
    )}>
      {emojify(entry.content)}
    </div>
  </div>
)


const ThreadDisplaySkeleton = () => (
  <div className="h-full flex-1 flex flex-col justify-center">
    <div className="w-full flex justify-center">
      <Spinner />
    </div>
  </div>
);


const ThreadDisplay = async ({ threadId }) => {
  const entries = await fetchEntries(threadId, USER);

  return (
    <ScrollArea className="flex-1 border-r ">
      <div className="p-8 space-y-1">
        {entries.map(e => (
          <ThreadEntry
            key={e.entry_id}
            id={`entry-${e.entry_id}`}
            entry={e}
          />
        ))}
      </div>
    </ScrollArea>
  );
}

const ThreadDisplayContainer = ({ threadId }) => (
  <Suspense fallback={<ThreadDisplaySkeleton />}>
    <ThreadDisplay threadId={threadId} />
  </Suspense>
)


const Page = ({ params }) => (
  <div className="h-full flex">
    <ThreadListContainer threadId={params.threadId} />
    <ThreadDisplayContainer threadId={params.threadId} />
  </div>
);

export default Page;
