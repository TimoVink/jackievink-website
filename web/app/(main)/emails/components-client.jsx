'use client';

import { useSearchParams } from 'next/navigation';
import { Letter } from 'react-letter';
import { extract } from 'letterparser';
import { format, formatDistanceToNow } from 'date-fns';

import { ThreadEntriesSkeleton, Card, ThreadEntryScrollContainer } from './components-server';
import { useApiCall, useTextApiCall } from '@/lib/api';

import './email.css';


export const ThreadEntry = ({ entry }) => {
  const { data } = useTextApiCall(`https://static.jackievink.com/${entry.emailUri}`);
  const { html, text } = extract(data);

  return (
    <Card id={`entry-${entry.entryId}`}>
      <div className="p-4 border-b">
        <div className="flex items-center space-x-1">
          <div className="flex flex-1 justify-between items-baseline space-x-1">
            <div className="line-clamp-1 font-semibold">
              {entry.authorFullName}
            </div>
            <div className="flex-none text-xs text-muted-foreground">
              <time
                dateTime={entry.timestamp}
                title={format(entry.timestamp, 'EEEE, MMMM d, yyyy @ h:mm a')}
                suppressHydrationWarning={true}
              >
                {formatDistanceToNow(entry.timestamp, { addSuffix: true })}
              </time>
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 email">
        <Letter html={html} text={text} />
      </div>
    </Card>
  );
};


export const ThreadEntriesFetch = ({ threadId }) => {
  const { data } = useApiCall(`api/email/entries?threadId=${threadId}`)

  return (
    <ThreadEntryScrollContainer>
      {data && data.map(e => (
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
