import { Layout } from '@/components/emails/layout';


const Page = async (props) => {
  const searchParams = await props.searchParams;
  return <Layout threadId={searchParams.id} />
};


export default Page;
