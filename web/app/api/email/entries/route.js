import { fetchEmailEntries } from '@/lib/data';
import { auth } from '@/auth';


export const GET = async (req) => {
  const session = await auth();
  const url = new URL(req.url);
  const threadId = url.searchParams.get('threadId');

  const data = await fetchEmailEntries(threadId, session.user.id);

  return Response.json(data);
}
