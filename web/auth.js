import NextAuth from 'next-auth';

import authConfig from '@/auth.config';
import { getUserProfile } from '@/lib/data';


export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, trigger }) {
      if (trigger == 'signIn' || trigger == 'signUp') {
        const profile = await getUserProfile(token.email);
        token.userId = profile.userId;
        token.fullName = profile.fullName;
        token.firstName = profile.firstName;
        token.email = profile.email;
      }
      return token;
    },
    session({ session, token }) {
      session.user = {
        id: token.userId,
        firstName: token.firstName,
        fullName: token.fullName,
        email: token.email,
        image: session.user.image
      };
      return session;
    }
  },
});
