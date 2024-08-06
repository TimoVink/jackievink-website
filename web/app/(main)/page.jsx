import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { auth } from '@/auth';


export default async function Home() {
  const session = await auth()
  return (
    <div className="h-full flex flex-col justify-center">
      <div className="flex justify-center">
        <pre>
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>
    </div>
  );
}
