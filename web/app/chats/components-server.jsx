import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Link as LinkIcon } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { SiMessenger, SiInstagram, SiWhatsapp } from '@icons-pack/react-simple-icons';
import Markdown from 'react-markdown'

import { Spinner } from '@/components/ui/spinner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

import { emojify } from '@/lib/emoji';
import { cn } from '@/lib/utils';

import { ThreadEntries, ThreadList } from './components-client';


import { userId } from '@/lib/auth';
const USER = userId;


export const Loading = () => (
  <div className="h-full w-full flex flex-col justify-center">
    <div className="w-full flex justify-center">
      <Spinner />
    </div>
  </div>
);

export const Card = ({ className, children }) => (
  <div className={cn("rounded-2xl bg-white h-full", className)}>
    {children}
  </div>
);


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
    href={`/chats?id=${thread.threadId}`}
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


const ThreadBubble = ({ entryId, author, outline, children }) => (
  <div
    id={`entry-${entryId}`}
    className={cn(
      'w-full flex text-md',
      author === USER ? 'justify-end' : 'justify-start'
    )}
  >
    <div className={cn(
      'max-w-[36rem] rounded-2xl px-4 py-2 space-y-2 break-words',
      outline
        ? cn(
          'border bg-white text-primary',
          author === USER
            ? 'border-primary text-primary'
            : 'border-muted-foreground text-muted-foreground',
        )
        : cn(
          author === USER
            ? 'text-primary-foreground bg-primary'
            : 'text-inherit bg-muted',
        )
    )}>
      {children}
    </div>
  </div>
);

const ThreadTextEntry = ({ entryId, author, content }) => (
  <ThreadBubble entryId={entryId} author={author}>
    <Markdown>{emojify(content)}</Markdown>
  </ThreadBubble>
);

const ThreadLinkEntry = ({ entryId, author, linkText, linkUri }) => (
  <ThreadBubble entryId={entryId} author={author} outline>
    <a href={linkUri} className="space-x-2">
      <LinkIcon
        className="inline"
        size="1em"
        strokeWidth={3}
      />
      <span>{linkText || linkUri}</span>
    </a>
  </ThreadBubble>
);

const ThreadVisualMediaEntry = ({ entryId, author, mediaUri }) => (
  <div
    id={`entry-${entryId}`}
    className={cn(
      'w-full flex',
      author === USER ? 'justify-end' : 'justify-start'
    )}
  >
    <Image
      className="max-w-96 max-h-96 !relative !w-auto !h-auto rounded-2xl"
      src={`https://static.jackievink.com/${mediaUri}`}
      fill
    />
  </div>
)

const ThreadEntry = ({ entry }) => {
  if (entry.type === 'im-text') {
    return <ThreadTextEntry {...entry} />
  } else if (entry.type === 'im-link') {
    return <ThreadLinkEntry {...entry} />
  } else if (entry.type === 'im-media-visual') {
    return <ThreadVisualMediaEntry {...entry} />
  }

  return <div />;
}


export const ThreadEntryGroup = ({ entryGroup }) => (
  <div>
    {entryGroup.author !== USER && (
      <div className="px-4 pt-2 pb-0.5 text-[0.67rem] tracking-wide text-muted-foreground">
        {cleanAuthor(entryGroup.author)}
      </div>
    )}
    <div className="space-y-1">
      {entryGroup.entries.map(e => (
        <ThreadEntry key={e.entryId} entry={({ ...e, author: entryGroup.author })} />
      ))}
    </div>
  </div>
);


export const ThreadEntriesSkeleton = () => (
  <ScrollContainer>
    <Loading />
  </ScrollContainer>
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
    <div className="flex-1 p-4 pl-2">
      {detailComponent}
    </div>
  </div>
);
