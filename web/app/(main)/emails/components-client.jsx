'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Letter } from 'react-letter';
import { extract } from 'letterparser';

import { ThreadListEntry, ThreadEntriesSkeleton, ThreadListSkeleton, Card, ThreadListScrollContainer, ThreadEntryScrollContainer } from './components-server';
import { useApiCall, useTextApiCall } from '@/lib/api';


export const ThreadEntry = ({ entry }) => {
  const { data } = useTextApiCall(`https://static.jackievink.com/${entry.emailUri}`);
  const { html, text } = extract(data);

  return (
    <Card className="p-4">
      <Letter html={html} text={text} />
    </Card>
  );
};


export const ThreadEntriesFetch = ({ threadId }) => {
  const { data } = useApiCall(`api/email/entries?threadId=${threadId}`)

  return (
    <ThreadEntryScrollContainer>
      {data.map(e => (
        <ThreadEntry key={e.entryId} entry={e} />
      ))}
    </ThreadEntryScrollContainer>
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


export const ThreadList = async ({ threadId }) => {
  const router = useRouter();
  const { data } = useApiCall('api/email/threads');
  const allThreadIds = new Set(data.map(t => t.threadId));
  if (!allThreadIds.has(threadId)) {
    if (data && data.length) {
      debugger;
      router.replace(`emails?id=${data[0].threadId}`);
    } else {
      return <ThreadListSkeleton />;
    }
  }

  return (
    <Card className="h-full">
      <ThreadListScrollContainer>
        {data.map(t => (
          <ThreadListEntry
            key={t.threadId}
            thread={t}
            isActive={threadId === t.threadId}
          />
        ))}
      </ThreadListScrollContainer>
    </Card>
  )
}
