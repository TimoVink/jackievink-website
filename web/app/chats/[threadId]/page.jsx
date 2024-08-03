import { ScrollArea } from '@/components/ui/scroll-area';

import { fetchChatEntries, fetchAllChatThreadIds } from '@/lib/data';
import { emojify } from '@/lib/emoji';
import { cn } from '@/lib/utils';


const USER = 'timo.vink';


const ThreadEntry = ({ entry }) => (
  <div
    id={`entry-${entry.entryId}`}
    className={cn(
      'w-full flex text-md',
      entry.author === USER ? 'justify-end' : 'justify-start'
    )}
  >
    <div className={cn(
      'max-w-[36rem] rounded-2xl px-4 py-2 break-words',
      entry.author === USER ? 'bg-primary' : 'bg-muted',
      entry.author === USER ? 'text-primary-foreground' : 'bg-muted',
    )}>
      {emojify(entry.content)}
    </div>
  </div>
)


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
