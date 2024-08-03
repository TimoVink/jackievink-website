import { Suspense } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { SiMessenger, SiInstagram, SiWhatsapp } from '@icons-pack/react-simple-icons';
import Link from 'next/link';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from "@/components/ui/skeleton"
import { fetchChatThreads } from '@/lib/data';


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

const cleanAuthor = (author) => {
  const firstName = author.split(/[\.\-]/)[0];
  return `${firstName[0].toUpperCase()}${firstName.substring(1)}`;
}

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
          <time dateTime={thread.timestamp} title={format(thread.timestamp, 'EEEE, MMMM q, yyyy @ h:mm a')}>
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
  const threads = await fetchChatThreads(USER);
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

const Layout = ({ params, children }) => (
  <div className="h-full flex">
    <ThreadListContainer threadId={params.threadId} />
    <div className="flex-1">
      {children}
    </div>
  </div>
);


export default Layout;
