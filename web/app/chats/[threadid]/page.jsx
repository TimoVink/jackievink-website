import { format, formatDistanceToNow } from 'date-fns';
import { SiMessenger, SiInstagram, SiWhatsapp } from '@icons-pack/react-simple-icons';

import { ScrollArea } from '@/components/ui/scroll-area';
import { fetchEntries, fetchThreads } from '@/lib/data';
import { emojify } from '@/lib/emoji';
import { cn } from '@/lib/utils';
import Link from 'next/link';


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

const ThreadList = async ({ threadId }) => {
  const threads = await fetchThreads('instant-message', USER);
  return (
    <ScrollArea className="w-[28rem] border-r">
      <div className="p-4 space-y-2">
        {threads.map(t => (
          <Link
            key={t.thread_id}
            id={`thread-${t.thread_id}`}
            className="block border rounded-lg py-2 px-3 text-sm space-y-1"
            href={`/chats/${t.thread_id}`}
          >
            <div className="flex items-center space-x-1">
              <SourceIcon source={t.source} />
              <div className="flex flex-1 justify-between items-baseline space-x-1">
                <div className="line-clamp-1 font-semibold">
                 {t.title}
                </div>
                <div className="flex-none text-xs text-muted-foreground">
                  <time datetime={t.timestamp} title={format(t.timestamp, 'EEEE, MMMM q, yyyy @ h:mm a')}>
                    {formatDistanceToNow(t.timestamp, { addSuffix: true })}
                  </time>
                </div>
              </div>
            </div>
            <div className="line-clamp-1 text-xs text-muted-foreground">
              {t.content
                ? `${t.author}: ${t.content}`
                : `${t.author} sent a message`}
            </div>
          </Link>
        ))}
      </div>
    </ScrollArea>
  );
}


const ThreadEntry = ({ entry }) => (
  <div className={cn(
    'w-full flex text-md',
    entry.author === USER ? 'justify-end' : 'justify-start'
  )}>
    <div className={cn(
      "max-w-[36rem] rounded-2xl px-4 py-2 break-words",
      entry.author === USER ? "bg-primary" : "bg-muted",
      entry.author === USER ? "text-primary-foreground" : "bg-muted",
    )}>
      {emojify(entry.content)}
    </div>
  </div>
)


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


const Page = ({ params }) => {
  const threadId = params.threadid;
  return (
    <div className="h-full flex">
      <ThreadList threadId={threadId} />
      <ThreadDisplay threadId={threadId} />
    </div>
  );
}

export default Page;
