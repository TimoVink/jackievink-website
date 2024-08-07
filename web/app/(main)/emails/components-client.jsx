'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Letter } from 'react-letter';
import { extract } from 'letterparser';

import { ScrollContainer, ThreadListEntry, ThreadEntriesSkeleton, ThreadListSkeleton, Card } from './components-server';
import { makeApiCall } from '@/lib/api';


export const ThreadEntry = async ({ entry }) => {
  const data = await fetch(`https://static.jackievink.com/${entry.emailUri}`);
  const s = await data.text();
  const { html, text } = extract(s);

  return (
    <Card className="p-4">
      <Letter html={html} text={text} />
    </Card>
  );
};


export const ThreadEntriesFetch = async ({ threadId }) => {
  const data = await makeApiCall(`api/email/entries?threadId=${threadId}`)

  return (
    <div>
      {data.map(e => (
        <ThreadEntry key={e.entryId} entry={e} />
      ))}
    </div>
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
  const data = await makeApiCall('api/email/threads');
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
