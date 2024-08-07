import Google from 'next-auth/providers/google';


export default {
  trustHost: true,
  providers: [Google],
  callbacks: {
    authorized({ auth }) {
      return !!auth
    },
  }
};
