'use client';

import { useSearchParams } from 'next/navigation';
import { Letter } from 'react-letter';
import { extract } from 'letterparser';

import { ThreadEntriesSkeleton, Card, ThreadEntryScrollContainer } from './components-server';
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
