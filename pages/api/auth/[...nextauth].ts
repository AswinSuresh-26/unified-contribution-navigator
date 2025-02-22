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
    newUser: '/profile' // Redirect new users to their profile page
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
    async signIn({ user, account, profile }: any) {
      if (profile?.email) {
        // Create or update user skills if they don't exist
        await prisma.user.upsert({
          where: { email: profile.email },
          update: {},
          create: {
            email: profile.email,
            name: user.name || '',
            image: user.image || '',
            githubId: profile.id.toString(),
            skills: [] // Initialize with empty skills array
          },
        });
      }
      return true;
    },
  },
  events: {
    async signIn(message) {
      console.log('User signed in:', message);
    },
    async signOut(message) {
      console.log('User signed out:', message);
    },
  },
  debug: process.env.NODE_ENV === 'development',
  theme: {
    colorScheme: "auto",
    brandColor: "#0070f3", // Next.js blue
    logo: "", // Add your logo URL here
  },
};

export default NextAuth(authOptions); 