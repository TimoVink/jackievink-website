import { redirect } from 'next/navigation';

import { fetchLatestThreadId } from '@/lib/data';
import Spinner from '@/components/ui/spinner';
import { Suspense } from 'react';


const USER = 'timo.vink';


const Loading = () => (
  <div className="h-full w-full flex flex-col justify-center">
    <div className="w-full flex justify-center">
      <Spinner />
    </div>
  </div>
)

const Redirect = async () => {
  const threadId = await fetchLatestThreadId('instant-message', USER);
  redirect(`/chats/${threadId}`);
}

const Page = () => (
  <Suspense fallback={<Loading />}>
    <Redirect />
  </Suspense>
);


export default Page;
