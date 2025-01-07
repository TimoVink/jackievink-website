'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Letter } from 'react-letter';
import { extract } from 'letterparser';
import { format, formatDistanceToNow } from 'date-fns';

import { ThreadEntriesSkeleton, Card, ThreadEntryScrollContainer } from './components-server';
import { useApiCall, useTextApiCall } from '@/lib/api';
import ClientOnly from '@/components/clientonly';

import './email.css';


const handleDownload = async (path, name) => {
  // Download as blob
  const url = `https://static.jackievink.com/${path}`;
  const response = await fetch(url, { method: 'GET' });
  if (!response.ok) {
    console.error('Failed to download file');
    return;
  }
  const blob = await response.blob();

  // Create and click a link element
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = name;
  document.body.appendChild(link);
  link.click();

  // Clean up
  document.body.removeChild(link);
};


function isEmptyOrBrOnly(element) {
  // If no child nodes at all, it’s empty
  if (!element.hasChildNodes()) {
    return true;
  }

  // Check all child nodes
  for (const child of element.childNodes) {
    if (child.nodeType === Node.ELEMENT_NODE) {
      // If it’s an element, it must be a <br>, otherwise false
      if (child.nodeName.toLowerCase() !== 'br') {
        return false;
      }
    } else if (child.nodeType === Node.TEXT_NODE) {
      // If it’s text, check if it’s only whitespace
      if (/\S/.test(child.textContent)) {
        return false;
      }
    } else {
      // Any other node type (comment, etc.) => treat as non-empty
      return false;
    }
  }

  // If we make it here, every node was a <br> or whitespace
  return true;
}

export const ThreadEntry = ({ entry }) => {
  const { data } = useTextApiCall(`https://static.jackievink.com/${entry.emailUri}`);
  const { html, text, from } = extract(data);

  const emailRef = useRef(null);

  useEffect(() => {
    if (!emailRef?.current) {
      return;
    }

    // Get all email messages
    for (const msg of emailRef.current.querySelectorAll('div[id^="msg_"] div[dir="ltr"]')) {
      // Get children in reverse order
      const divs = [...msg.querySelectorAll('& > div, & > br')].reverse();

      for (const d of divs) {
        if (isEmptyOrBrOnly(d)) {
          // Hide or remove entirely
          d.style.display = 'none';
        } else {
          break;
        }
      }
    }
  }, [emailRef.current]);

  return (
    <Card id={`entry-${entry.entryId}`}>
      <div className="p-4 border-b">
        <div className="flex items-center space-x-1">
          <div className="flex flex-1 justify-between items-baseline space-x-1">
            <div className="line-clamp-1 font-semibold">
              {entry.authorFullName || from?.name || from?.address}
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
      <div className="p-4 email" ref={emailRef}>
        <Letter html={html} text={text} />
      </div>
      {!!entry.media?.length && <div className="p-4 border-t space-y-2">
        {entry.media.map(a => (
          <div key={a.uri}>
            📎 <button onClick={() => handleDownload(a.uri, a.name)}>{a.name}</button>
          </div>
        ))}
      </div>}
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
    ? <ClientOnly><ThreadEntriesFetch threadId={threadId} /></ClientOnly>
    : <ThreadEntriesSkeleton />;

  return result;
}
