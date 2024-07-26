import { ScrollArea } from '@/components/ui/scroll-area';
import { fetchEntries } from '@/lib/data';
import { emojify } from '@/lib/emoji';
import { cn } from '@/lib/utils';
import { Suspense } from 'react';
import Spinner from '@/components/ui/spinner';


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
          <ThreadEntry key={e.entryId} entry={e} />
        ))}
      </div>
    </ScrollArea>
  );
}

const Page = ({ params }) => (
  <Suspense fallback={<ThreadDisplaySkeleton />}>
    <ThreadDisplay threadId={params.threadId} />
  </Suspense>
);


export default Page;
