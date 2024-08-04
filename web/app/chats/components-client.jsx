'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import { ScrollContainer, ThreadListEntry, ThreadEntryGroup, ThreadEntriesSkeleton } from './components-server';
import { useApiCall } from '@/lib/api';



export const ThreadEntriesFetch = ({ threadId }) => {
  const { data } = useApiCall(`api/chat/entries?threadId=${threadId}`);

  return (
    <ScrollContainer holdPadding>
      <div className="h-full px-3 flex flex-col-reverse overflow-y-auto">
        <div className="space-y-1">
          {data.map(eg => (
            <ThreadEntryGroup key={eg.entries[0].entryId} entryGroup={eg} />
          ))}
        </div>
      </div>
    </ScrollContainer>
  )
}


export const ThreadEntries = () => {
  const searchParams = useSearchParams();
  const threadId = searchParams.get('id');

  const result = threadId
    ? <ThreadEntriesFetch threadId={threadId} />
    : <ThreadEntriesSkeleton />;

  return result;
}


export const ThreadList = ({ threadId }) => {
  const router = useRouter();
  const { data } = useApiCall('api/chat/threads');
  const allThreadIds = new Set(data.map(t => t.threadId));
  if (!allThreadIds.has(threadId)) {
    router.replace(`chats?id=${data[0].threadId}`);
  }

  return (
    <ScrollContainer>
      {data.map(t => (
        <ThreadListEntry
          key={t.threadId}
          thread={t}
          isActive={threadId === t.threadId}
        />
      ))}
    </ScrollContainer>
  )
}
