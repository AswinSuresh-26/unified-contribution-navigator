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
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          githubId: profile.id.toString(),
          skills: [],
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
    newUser: '/profile',
  },
  callbacks: {
    async session({ session, user }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          githubId: user.githubId,
          skills: user.skills || [],
        },
      };
    },
    async signIn({ user, account, profile }) {
      if (!profile?.email) {
        console.error("No email provided by GitHub");
        return false;
      }

      try {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
          where: { email: profile.email },
        });

        if (!existingUser) {
          // Create new user
          await prisma.user.create({
            data: {
              email: profile.email,
              name: user.name || profile.login || '',
              image: user.image || '',
              githubId: profile.id.toString(),
              skills: [],
            },
          });
        } else {
          // Update existing user
          await prisma.user.update({
            where: { email: profile.email },
            data: {
              name: user.name || profile.login || '',
              image: user.image || '',
              githubId: profile.id.toString(),
            },
          });
        }

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
    async createUser(message) {
      console.log('User created:', message);
    },
    async linkAccount(message) {
      console.log('Account linked:', message);
    },
    async session(message) {
      console.log('Session updated:', message);
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
};

export default NextAuth(authOptions); 