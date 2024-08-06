import { Layout, ThreadEntriesSkeleton, ThreadListSkeleton } from "./components-server";


const Loading = () => (
  <Layout
    listComponent={<ThreadListSkeleton />}
    detailComponent={<ThreadEntriesSkeleton />}
  />
);


export default Loading;
