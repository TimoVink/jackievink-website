'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import InfiniteScroll from 'react-infinite-scroll-component';

import { makeApiCall } from '@/lib/api';
import Spinner from '@/components/ui/spinner';

import { MediaContainer, MediaPageSkeleton } from './components-server';


export const MediaPage = () => {
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const INITIAL_LIMIT = 256;
  const SUBSEQ_LIMIT = 128;

  useEffect(() => {
    makeApiCall(`api/media/items?limit=${INITIAL_LIMIT}&offset=${items.length}`)
      .then((data) => {
        setItems(data);
        if (data.length < INITIAL_LIMIT) {
          setHasMore(false);
        }
      })
      .catch((err) => console.log(err));
  }, []);

  const fetchMoreEntries = () => {
    makeApiCall(`api/media/items?limit=${SUBSEQ_LIMIT}&offset=${items.length}`)
      .then((data) => {
        setItems((prevItems) => [...prevItems, ...data]);
        if (data.length < SUBSEQ_LIMIT) {
          setHasMore(false);
        }
      })
      .catch((err) => console.log(err));
  };

  if (!items.length) {
    return <MediaPageSkeleton />;
  }

  return (
    <div id="items-infinite-scroll" className="h-full w-full flex flex-col overflow-y-auto">
      <InfiniteScroll
        dataLength={items.length}
        next={fetchMoreEntries}
        hasMore={hasMore}
        loader={items.length && (<div className="h-16 flex flex-col justify-center items-center"><Spinner /></div>)}
        scrollThreshold="4000px"
        scrollableTarget="items-infinite-scroll"
      >
        <MediaContainer>

        {items
          .filter(m => m.mediaType === 'photo' && m.mediaPlaceholder)
          .map(m => (
            <div key={`${m.entryId}_${m.mediaUri}`} className="flex-[1_1_12rem] aspect-square relative rounded-md">
              <Image
                className="object-cover"
                src={`https://static.jackievink.com/${m.mediaUri}`}
                placeholder='blur'
                blurDataURL={m.mediaPlaceholder}
                fill
              />
            </div>
          ))}
        </MediaContainer>
      </InfiniteScroll>
    </div>
  )
}
