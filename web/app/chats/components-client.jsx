'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import InfiniteScroll from 'react-infinite-scroll-component';
import { subMinutes } from 'date-fns';

import { ScrollContainer, ThreadListEntry, ThreadEntryGroup, ThreadEntriesSkeleton } from './components-server';
import { makeApiCall, useApiCall } from '@/lib/api';
import Spinner from '@/components/ui/spinner';


const cleanChatEntries = (rawEntries) => {
  const result = []

  let curAuthor = null;
  let curTimestamp = new Date(1900, 1, 1);
  let curEntries = [];

  const pushGroup = () => {
    if (curEntries.length) {
      result.push({
        author: curAuthor,
        entries: curEntries
      });
      curEntries = [];
    }
  }

  const pick = (object, keys) => {
    return keys.reduce((obj, key) => {
       if (object && object.hasOwnProperty(key)) {
          obj[key] = object[key];
       }
       return obj;
     }, {});
  }

  for (const entry of rawEntries) {
    if (entry.author !== curAuthor) {
      pushGroup();
      curAuthor = entry.author;
    }

    if (subMinutes(entry.timestamp, 15) > curTimestamp) {
      pushGroup();
    }
    curTimestamp = entry.timestamp

    const commonProps = ['entryId', 'timestamp', 'type'];
    if (entry.type === 'im-text') {
      curEntries.push(pick(entry, [...commonProps, 'content']))
    } else if (entry.type === 'im-link') {
      curEntries.push(pick(entry, [...commonProps, 'linkText', 'linkUri']))
    } else if (entry.type === 'im-media-visual' && entry.mediaType === 'photo') {
      curEntries.push(pick(entry, [...commonProps, 'mediaType', 'mediaName', 'mediaUri', 'mediaAspectWidth', 'mediaAspectHeight', 'mediaPlaceholder']))
    }
  }
  pushGroup();

  return result;
}


export const ThreadEntriesFetch = ({ threadId }) => {
  const [entries, setEntries] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const INITIAL_LIMIT = 64;
  const SUBSEQ_LIMIT = 16;

  useEffect(() => {
    makeApiCall(`api/chat/entries?threadId=${threadId}&limit=${INITIAL_LIMIT}&offset=${entries.length}`)
      .then((res) => {
        setEntries(res);
        if (res.length < INITIAL_LIMIT) {
          setHasMore(false);
        }
      })
      .catch((err) => console.log(err));
  }, []);

  const fetchMoreEntries = () => {
    makeApiCall(`api/chat/entries?threadId=${threadId}&limit=${SUBSEQ_LIMIT}&offset=${entries.length}`)
      .then((res) => {
        setEntries((prevItems) => [...res, ...prevItems]);
        if (res.length < SUBSEQ_LIMIT) {
          setHasMore(false);
        }
      })
      .catch((err) => console.log(err));
  };

  const cleanEntries = cleanChatEntries(entries);

  if (!entries.length) {
    return <ThreadEntriesSkeleton />;
  }

  return (
    <ScrollContainer holdPadding>
      <div id="entries-infinite-scroll" className="h-full px-3 flex flex-col-reverse overflow-y-auto">
        <InfiniteScroll
          dataLength={entries.length}
          next={fetchMoreEntries}
          style={{ display: 'flex', flexDirection: 'column-reverse' }}
          inverse
          hasMore={hasMore}
          loader={entries.length && (<div className="h-16 flex flex-col justify-center items-center"><Spinner /></div>)}
          scrollThreshold="2000px"
          scrollableTarget="entries-infinite-scroll"
        >
          <div className="space-y-1">
            {cleanEntries.map(eg => (
              <ThreadEntryGroup key={eg.entries[0].entryId} entryGroup={eg} />
            ))}
          </div>
        </InfiniteScroll>
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
