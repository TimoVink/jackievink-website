import { fetchChatEntries } from '@/lib/data';
import { userId } from '@/lib/auth';


export const GET = async (req) => {
  const url = new URL(req.url);
  const threadId = url.searchParams.get('threadId');
  const limit = url.searchParams.get('limit') || 64;
  const offset = url.searchParams.get('offset') || 0;

  const data = await fetchChatEntries(threadId, userId, limit, offset);

  return Response.json(data);
}
