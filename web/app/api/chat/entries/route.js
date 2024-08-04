import { fetchChatEntries } from '@/lib/data';
import { userId } from '@/lib/auth';


export const GET = async (req) => {
  const url = new URL(req.url);
  const threadId = url.searchParams.get('threadId');
  const data = await fetchChatEntries(threadId, userId);
  return Response.json(data);
}
