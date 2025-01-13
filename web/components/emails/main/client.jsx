'use client';


import { useRef, useEffect } from 'react';

import { format, formatDistanceToNow } from 'date-fns';
import { extract } from 'letterparser';
import { Printer } from 'lucide-react';
import { Letter } from 'react-letter';
import { useReactToPrint } from 'react-to-print';

import { ClientOnly } from '@/components/clientonly';
import { useApiCall, useTextApiCall } from '@/lib/api';
import { MyCard } from '../shared/server';
import { ThreadEntryScrollContainer, ThreadEntriesSkeleton } from './server';


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
    <MyCard id={`entry-${entry.entryId}`} className="break-inside-avoid">
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
    </MyCard>
  );
};


const ThreadEntriesFetch = ({ threadId }) => {
  const printRef = useRef(null);
  const triggerPrint = useReactToPrint({ contentRef: printRef });
  const { data } = useApiCall(`api/email/entries?threadId=${threadId}`)

  return (
    <div ref={printRef} className="h-full">
      <ThreadEntryScrollContainer>
        {data && data.length && <>
          <div className="text-xl px-4 pt-2 flex justify-between">
            <div>{data[data.length -1].emailSubject}</div>
            <button className="print:hidden text-muted-foreground" onClick={triggerPrint}>
              <Printer />
            </button>
          </div>
          {data.map(e => (
            <ThreadEntry key={e.entryId} entry={e} />
          ))}
        </>}
      </ThreadEntryScrollContainer>
    </div>
  )
}


export const ThreadEntries = ({ threadId }) => (
  threadId
    ? <ClientOnly><ThreadEntriesFetch threadId={threadId} /></ClientOnly>
    : <ThreadEntriesSkeleton />
);
