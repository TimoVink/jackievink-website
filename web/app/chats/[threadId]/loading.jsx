import { Spinner } from '@/components/ui/spinner';


const Loading = () => (
  <div className="h-full w-full flex flex-col justify-center">
    <div className="w-full flex justify-center">
      <Spinner />
    </div>
  </div>
);


export default Loading;
