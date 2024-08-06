import { fetchChatThreads } from '@/lib/data';
import { auth } from '@/auth';


export const GET = async () => {
  const session = await auth();
  const data = await fetchChatThreads(session.user.id);
  return Response.json(data);
}
