import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";


const Page = () => {
  return (
    <div className="h-full flex flex-col justify-center">
      <div className="flex justify-center">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">EMAILS PAGE</CardTitle>
            <CardDescription>Here you can find all your emails...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}

export default Page;