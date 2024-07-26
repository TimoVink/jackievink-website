import { fetchLatestThreadId } from '@/lib/data';
import { redirect } from 'next/navigation';


const USER = 'timo.vink';


const Page = async () => {
  const threadId = await fetchLatestThreadId('instant-message', USER);
  redirect(`/chats/${threadId}`);
}


export default Page;
