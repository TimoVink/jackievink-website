import { Sidebar } from './sidebar/server';
import { Main } from './main/server';


export const Layout = ({ threadId, skeleton }) => (
  <div className="h-full flex bg-muted">
    <div className="h-full flex-none w-[28rem]">
      <Sidebar threadId={threadId} skeleton={skeleton} />
    </div>
    <div className="flex-1 p-4 pl-2">
      <Main threadId={threadId} skeleton={skeleton} />
    </div>
  </div>
);
