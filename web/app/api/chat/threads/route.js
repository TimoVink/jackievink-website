import { fetchChatThreads } from '@/lib/data';
import { auth } from '@/auth';


export const GET = auth(async (req) => {
  if (!req.auth) {
    return Response.json({ message: "Not authenticated" }, { status: 401 })
  }

  const data = await fetchChatThreads(req.auth.user.id);
  return Response.json(data);
});
