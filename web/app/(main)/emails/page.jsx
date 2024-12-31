import { Layout, ThreadEntriesSuspenseContainer, ThreadListSuspenseContainer } from './components-server';


const Page = async props => {
  const searchParams = await props.searchParams;

  return (
    <Layout
      threadId={searchParams.id}
      listComponent={<ThreadListSuspenseContainer threadId={searchParams.id} />}
      detailComponent={<ThreadEntriesSuspenseContainer threadId={searchParams.id} />}
    />
  );
};


export default Page;
