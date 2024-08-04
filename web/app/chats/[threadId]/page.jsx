import { Suspense } from 'react';
import Image from 'next/image';
import { Link as LinkIcon } from 'lucide-react';
import Markdown from 'react-markdown'

import Loading from './loading';

import { ScrollArea } from '@/components/ui/scroll-area';

import { fetchChatEntries, fetchAllChatThreadIds } from '@/lib/data';
import { emojify } from '@/lib/emoji';
import { cn } from '@/lib/utils';


const USER = 'timo.vink';


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
      className="max-w-64 max-h-64 !relative !w-auto !h-auto rounded-2xl"
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

const cleanAuthor = (author) => {
  const firstName = author.split(/[\.\-]/)[0];
  return `${firstName[0].toUpperCase()}${firstName.substring(1)}`;
}

const ThreadEntryGroup = ({ entryGroup }) => (
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

const ThreadDisplay = async ({ threadId }) => {
  const entryGroups = await fetchChatEntries(threadId, USER);

  return (
    <ScrollArea>
      <div className="h-full p-8 space-y-1 flex flex-col-reverse overflow-y-auto">
        <div>
          {entryGroups.map(eg => (
            <ThreadEntryGroup key={eg.entries[0].entryId} entryGroup={eg} />
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}

export async function generateStaticParams() {
  const entries = await fetchAllChatThreadIds();
  const result = entries.map(threadId => ({ threadId }))
  return result;
}

const Page = ({ params }) => (
  <Suspense fallback={<Loading />}>
    <ThreadDisplay threadId={params.threadId} />
  </Suspense>
);


export default Page;
