import { Layout, ThreadEntriesSuspenseContainer, ThreadListSuspenseContainer } from './components-server';


const Page = ({ searchParams }) => (
  <Layout
    threadId={searchParams.id}
    listComponent={<ThreadListSuspenseContainer threadId={searchParams.id} />}
    detailComponent={<ThreadEntriesSuspenseContainer threadId={searchParams.id} />}
  />
);


export default Page;
