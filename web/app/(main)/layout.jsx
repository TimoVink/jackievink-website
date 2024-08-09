import { Suspense } from 'react';

import NavLink from '@/components/navlink';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import { auth, signOut } from '@/auth';


const links = {
  '/chats': 'Chats',
  '/emails': 'Emails',
  '/media': 'Photos',
};


const HeaderNav = () => (
  <nav className="flex items-center space-x-8">
    {Object.entries(links).map(([url, name]) => (
      <NavLink key={url} href={url}>
        {name}
      </NavLink>
    ))}
  </nav>
);


function SignOut() {
  return (
    <form
      action={async () => {
        "use server"
        await signOut()
      }}
      className="w-full"
    >
      <Button variant="ghost" className="w-full p-0">
        Sign Out
      </Button>
    </form>
  )
}


async function HeaderSessionControl() {
  const session = await auth();
  const initials = session.user.fullName
    .split(" ")
    .map(s => s.charAt(0))
    .join('');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative w-8 h-8 rounded-full">
          <Avatar className="w-8 h-8">
            {session.user.image && (
              <AvatarImage
                src={session.user.image}
                alt={session.user.fullName}
              />
            )}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {session.user.fullName}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {session.user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuItem>
          <SignOut />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


const Header = () => (
  <header className="border-b">
    <div className="flex justify-between h-14 items-center relative px-4">
      <div className="flex-1" />
      <HeaderNav />
      <div className="flex-1 flex justify-end">
        <Suspense>
          <HeaderSessionControl />
        </Suspense>
      </div>
    </div>
  </header>
);

const Layout = ({ children }) => (
  <div className="w-full h-full flex flex-col bg-white border rounded-2xl shadow-xl overflow-hidden">
    <Header />
    <main className="flex-1 overflow-y-auto">
      {children}
    </main>
    <div className="h-[20vh] absolute top-0 left-0 right-0 bg-primary -z-10" />
  </div>
);


export default Layout;
