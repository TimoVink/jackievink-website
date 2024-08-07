import { signIn } from '@/auth';


const Page = () => (
  <form
    action={async () => {
      'use server';
      await signIn('google');
    }}
  >
    <button type="submit">Signin with Google?</button>
  </form>
);


export default Page;
