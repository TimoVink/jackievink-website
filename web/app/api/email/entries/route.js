import { fetchEmailEntries } from '@/lib/data';
import { auth } from '@/auth';


export const GET = auth(async (req) => {
  if (!req.auth) {
    return Response.json({ message: "Not authenticated" }, { status: 401 })
  }

  const url = new URL(req.url);
  const threadId = url.searchParams.get('threadId');

  const data = await fetchEmailEntries(threadId, req.auth.user.id);

  return Response.json(data);
});
