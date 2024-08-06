import Google from 'next-auth/providers/google';


export default {
  providers: [Google],
  callbacks: {
    authorized({ auth }) {
      return !!auth
    },
  }
};
