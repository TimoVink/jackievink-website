import { Link as LinkIcon } from 'lucide-react';
import Markdown from 'react-markdown'

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

const ThreadLinkEntry = ({ entryId, author, text, uri }) => (
  <ThreadBubble entryId={entryId} author={author} outline>
    <a href={uri} className="space-x-2">
      <LinkIcon
        className="inline"
        size="1em"
        strokeWidth={3}
      />
      <span>{text || uri}</span>
    </a>
  </ThreadBubble>
);

const ThreadEntry = ({ entry }) => {
  if (entry.type === 'im-text') {
    return <ThreadTextEntry {...entry} />
  } else if (entry.type === 'im-link') {
    return <ThreadLinkEntry {...entry} />
  }

  return <div />;
}

const ThreadDisplay = async ({ threadId }) => {
  const entries = await fetchChatEntries(threadId, USER);

  return (
    <ScrollArea>
      <div className="p-8 space-y-1">
        {entries.map(e => (
          <ThreadEntry key={e.entryId} entry={e} />
        ))}
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
  <ThreadDisplay threadId={params.threadId} />
);


export default Page;
