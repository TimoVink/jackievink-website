import { Layout } from '@/components/chats/layout';


const Page = async (props) => {
  const searchParams = await props.searchParams;
  return <Layout threadId={searchParams.id} />
};


export default Page;
