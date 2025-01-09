'use client';


import { useEffect, useState } from 'react';

import { subMinutes } from 'date-fns';
import InfiniteScroll from 'react-infinite-scroll-component';

import { makeApiCall } from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';
import { ScrollContainer } from '../shared/server';
import { ThreadEntriesSkeleton, ThreadEntryGroup } from './server';


const cleanChatEntries = (userId, rawEntries) => {
  const result = []

  let curAuthorId = null;
  let curAuthorFirstName = null;
  let curAuthorFullName = null;
  let curTimestamp = new Date(1900, 1, 1);
  let curEntries = [];

  const pushGroup = () => {
    if (curEntries.length) {
      result.push({
        authorId: curAuthorId,
        authorFirstName: curAuthorFirstName,
        authorFullName: curAuthorFullName,
        userIsAuthor: userId === curAuthorId,
        entries: curEntries,
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
    if (entry.authorId !== curAuthorId) {
      pushGroup();
      curAuthorId = entry.authorId;
      curAuthorFirstName = entry.authorFirstName;
      curAuthorFullName = entry.authorFullName;
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
    } else if (entry.type === 'im-call') {
      curEntries.push(pick(entry, [...commonProps, 'missed', 'duration']))
    }
  }
  pushGroup();

  return result;
}


export const ThreadEntriesFetch = ({ userId, threadId }) => {
  const [entries, setEntries] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const INITIAL_LIMIT = 128;
  const SUBSEQ_LIMIT = 64;

  useEffect(() => {
    makeApiCall(`api/chat/entries?threadId=${threadId}&limit=${INITIAL_LIMIT}&offset=${entries.length}`)
      .then((data) => {
        setEntries(data);
        if (data.length < INITIAL_LIMIT) {
          setHasMore(false);
        }
      })
      .catch((err) => console.log(err));
  }, []);

  const fetchMoreEntries = () => {
    makeApiCall(`api/chat/entries?threadId=${threadId}&limit=${SUBSEQ_LIMIT}&offset=${entries.length}`)
      .then((data) => {
        setEntries((prevItems) => [...data, ...prevItems]);
        if (data.length < SUBSEQ_LIMIT) {
          setHasMore(false);
        }
      })
      .catch((err) => console.log(err));
  };

  const cleanEntries = cleanChatEntries(userId, entries);

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
          scrollThreshold="4000px"
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
