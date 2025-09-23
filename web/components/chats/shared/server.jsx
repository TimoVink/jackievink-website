import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';


export const MyCard = ({ className, children }) => (
  <div className={cn("rounded-2xl bg-white h-full shadow-md", className)}>
    {children}
  </div>
);


export const ScrollContainer = ({ children, holdPadding }) => (
  <MyCard className="h-full">
    <div className="py-4 px-1 h-full">
      <ScrollArea>
        <div className={cn(
          "space-y-2 h-full",
          !holdPadding && 'px-3'
        )}>
          {children}
        </div>
      </ScrollArea>
    </div>
  </MyCard>
);
