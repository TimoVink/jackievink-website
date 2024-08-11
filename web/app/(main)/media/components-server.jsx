import { Skeleton } from '@/components/ui/skeleton';


export const MediaContainer = ({ children }) => (
  <div className="flex flex-wrap p-1 gap-1 h-full">
    {children}
  </div>
);

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
