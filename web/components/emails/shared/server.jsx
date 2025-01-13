import { cn } from "@/lib/utils";


export const MyCard = ({ className, children }) => (
  <div className={cn("rounded-2xl bg-white h-full shadow-md", className)}>
    {children}
  </div>
);
