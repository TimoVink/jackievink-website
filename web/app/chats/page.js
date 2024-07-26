import { format, formatDistanceToNow } from 'date-fns';

import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchEntries, fetchThreads } from "@/lib/data";
import { SiMessenger, SiInstagram, SiWhatsapp } from '@icons-pack/react-simple-icons';
import { cn } from '@/lib/utils';



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

const ThreadList = async () => {
  const threads = await fetchThreads('instant-message', USER);
  return (
    <ScrollArea className="w-[28rem] border-r">
      <div className="p-4 space-y-2">
        {threads.map(t => (
          <div key={t.thread_id} id={`thread-${t.thread_id}`} className="border rounded-lg py-2 px-3 text-sm space-y-1">
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
            <div className="line-clamp-2 text-xs text-muted-foreground">
              {t.content
                ? `${t.author}: ${t.content}`
                : `${t.author} sent a message`}
            </div>
          </div>
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
      "rounded-2xl px-4 py-2",
      entry.author === USER ? "bg-primary" : "bg-muted",
      entry.author === USER ? "text-primary-foreground" : "bg-muted",
    )}>
      {entry.content}
    </div>
  </div>
)


const ThreadDisplay = async () => {
  const entries = await fetchEntries('d624a1dbd2242b04', USER);

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


const Page = () => {
  return (
    <div className="h-full flex">
      <ThreadList />
      <ThreadDisplay />
    </div>
  );
}

export default Page;
