import { fetchChatEntries } from '@/lib/data';
import { auth } from '@/auth';


export const GET = auth(async (req) => {
  if (!req.auth) {
    return Response.json({ message: "Not authenticated" }, { status: 401 })
  }

  const url = new URL(req.url);
  const threadId = url.searchParams.get('threadId');
  const limit = url.searchParams.get('limit') || 64;
  const offset = url.searchParams.get('offset') || 0;

  const data = await fetchChatEntries(threadId, req.auth.user.id, limit, offset);

  return Response.json(data);
});
