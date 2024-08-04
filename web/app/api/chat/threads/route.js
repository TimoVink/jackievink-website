import { fetchChatThreads } from '@/lib/data';
import { userId } from '@/lib/auth';


export const GET = async () => {
  const data = await fetchChatThreads(userId);
  return Response.json(data);
}
