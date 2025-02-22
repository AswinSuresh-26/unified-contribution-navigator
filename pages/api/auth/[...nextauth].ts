import { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: {
        params: {
          scope: 'read:user user:email repo',
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.githubId = profile?.sub;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.githubId = token.githubId as string;
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (!profile?.email) {
        console.error("No email provided by GitHub");
        return false;
      }

      try {
        // Update or create user in database
        await prisma.user.upsert({
          where: { email: profile.email },
          create: {
            email: profile.email,
            name: user.name || profile.login || '',
            image: user.image || '',
            githubId: profile.sub || '',
            skills: [],
          },
          update: {
            name: user.name || profile.login || '',
            image: user.image || '',
            githubId: profile.sub || '',
          },
        });
        return true;
      } catch (error) {
        console.error("Error during sign in:", error);
        return false;
      }
    },
  },
  events: {
    async signIn(message) {
      console.log('User signed in:', message);
    },
    async signOut(message) {
      console.log('User signed out:', message);
    },
    async error(message) {
      console.error('Auth error:', message);
    },
  },
  debug: process.env.NODE_ENV === 'development',
  logger: {
    error: (code, metadata) => {
      console.error('NextAuth error:', code, metadata);
    },
    warn: (code) => {
      console.warn('NextAuth warning:', code);
    },
    debug: (code, metadata) => {
      console.log('NextAuth debug:', code, metadata);
    },
  },
}

export default NextAuth(authOptions); 