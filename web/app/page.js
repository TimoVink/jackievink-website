import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";


export default function Home() {
  return (
    <main className="h-full flex flex-col justify-center">
      <div className="flex justify-center">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Jackie Vink</CardTitle>
            <CardDescription>March 16, 1992 - May 31, 2024</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </main>
  );
}
