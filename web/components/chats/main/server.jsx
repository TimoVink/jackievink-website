import { Suspense } from 'react';
import Image from 'next/image';

import Markdown from 'react-markdown';
import { LinkIcon } from 'lucide-react';

import { auth } from '@/auth';
import { Loading } from '@/components/loading';
import { emojify } from '@/lib/emoji';
import { cn } from '@/lib/utils';
import { ScrollContainer } from '../shared/server';
import { ThreadEntriesFetch } from './client';


const ThreadBubble = ({ entryId, userIsAuthor, outline, children }) => (
  <div
    id={`entry-${entryId}`}
    className={cn(
      'w-full flex text-md',
      userIsAuthor ? 'justify-end' : 'justify-start'
    )}
  >
    <div className={cn(
      'max-w-[36rem] rounded-2xl px-4 py-2 space-y-2 break-words',
      outline
        ? cn(
          'border bg-white text-primary',
          userIsAuthor
            ? 'border-primary text-primary'
            : 'border-muted-foreground text-muted-foreground',
        )
        : cn(
          userIsAuthor
            ? 'text-primary-foreground bg-primary'
            : 'text-inherit bg-muted',
        )
    )}>
      {children}
    </div>
  </div>
);


const ThreadTextEntry = ({ entryId, userIsAuthor, content }) => (
  <ThreadBubble entryId={entryId} userIsAuthor={userIsAuthor}>
    <Markdown>{emojify(content)}</Markdown>
  </ThreadBubble>
);


const ThreadLinkEntry = ({ entryId, userIsAuthor, linkText, linkUri }) => (
  <ThreadBubble entryId={entryId} userIsAuthor={userIsAuthor} outline>
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


const ThreadVisualMediaEntry = ({ entryId, userIsAuthor, mediaUri, mediaAspectWidth, mediaAspectHeight, mediaPlaceholder }) => (
  <div
    id={`entry-${entryId}}`}
    className={cn(
      'w-full flex',
      userIsAuthor ? 'justify-end' : 'justify-start'
    )}
  >
    {mediaAspectWidth && mediaAspectHeight
      ? (
        <Image
          className="rounded-2xl"
          src={`https://static.jackievink.com/${mediaUri}`}
          width={Math.floor(mediaAspectWidth * 400)}
          height={Math.floor(mediaAspectHeight * 400)}
          placeholder='blur'
          blurDataURL={mediaPlaceholder}
          alt="An image sent in the chat"
        />
      ) : (
        <Image
          className="max-w-96 max-h-96 !relative !w-auto !h-auto rounded-2xl"
          src={`https://static.jackievink.com/${mediaUri}`}
          placeholder='blur'
          blurDataURL={mediaPlaceholder}
          alt="An image sent in the chat"
          fill
        />
      )
    }
  </div>
);


const ThreadCallEntry = ({ entryId, missed, duration }) => (
  <div id={`entry-${entryId}`} className="w-full flex justify-center tracking-wide text-muted-foreground text-xs py-1">
    {missed
      ? <span>Missed call</span>
      : !!duration
        ? <span>Video call for {duration} seconds</span>
        : <span>Video call ended</span>}
  </div>
);


const ThreadEntry = ({ entry }) => {
  if (entry.type === 'im-text') {
    return <ThreadTextEntry {...entry} />
  } else if (entry.type === 'im-link') {
    return <ThreadLinkEntry {...entry} />
  } else if (entry.type === 'im-media-visual') {
    return <ThreadVisualMediaEntry {...entry} />
  } else if (entry.type === 'im-call') {
    return <ThreadCallEntry {...entry} />
  }

  return <div />;
}


const getKey = (entry) =>
  entry.type === 'im-media-visual'
    ? `entry-${entry.entryId}-${entry.mediaUri}`
    : `entry-${entry.entryId}`;


export const ThreadEntryGroup = ({ entryGroup }) => (
  <div>
    {!entryGroup.userIsAuthor && (
      <div className="px-4 pt-2 pb-0.5 text-[0.67rem] tracking-wide text-muted-foreground">
        {entryGroup.authorFirstName}
      </div>
    )}
    <div className="space-y-1">
      {entryGroup.entries.map(e => (
        <ThreadEntry key={getKey(e)} entry={({ ...e, userIsAuthor: entryGroup.userIsAuthor })} />
      ))}
    </div>
  </div>
);


export const ThreadEntriesSkeleton = () => (
  <ScrollContainer>
    <Loading />
  </ScrollContainer>
);


const ThreadEntries = ({ threadId, userId }) => (
  threadId
    ? <ThreadEntriesFetch userId={userId} threadId={threadId} />
    : <ThreadEntriesSkeleton />
);


const ThreadEntriesSuspenseContainer = async ({ threadId }) => {
  const session = await auth();
  return (
    <Suspense key={threadId} fallback={<ThreadEntriesSkeleton />}>
      <ThreadEntries threadId={threadId} userId={session.user.id} />
    </Suspense>
  );
}


export const Main = ({ threadId, skeleton }) => (
  <div className="h-full w-full">
    {skeleton
      ? <ThreadEntriesSkeleton />
      : <ThreadEntriesSuspenseContainer threadId={threadId} />}
  </div>
);
