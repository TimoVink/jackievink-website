import Image from 'next/image';

import { auth } from '@/auth';
import { fetchMediaItems } from '@/lib/data';

import { Skeleton } from '@/components/ui/skeleton';


const MediaContainer = ({ children }) => (
  <div className="flex flex-wrap p-1 gap-1">
    {children}
  </div>
)

const MediaItemSkeleton = () => (
  <Skeleton className="flex-[1_1_12rem] aspect-square" />
);

export const MediaPageSkeleton = () => (
  <MediaContainer>
    {Array(128).fill().map((_, i) => (
      <MediaItemSkeleton key={i} />
    ))}
  </MediaContainer>
);


export const MediaPage = async () => {
  const session = await auth();
  const media = await fetchMediaItems(session.user.id);

  return (
    <MediaContainer>
      {media
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
  );
}
