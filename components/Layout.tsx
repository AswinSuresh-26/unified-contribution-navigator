import { ReactNode } from 'react';
import Link from 'next/link';
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function Layout({ children }: { children: ReactNode }) {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-slate-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <nav className="space-x-4">
            <Link href="/" className="hover:text-slate-300">
              Home
            </Link>
            {session && (
              <Link href="/profile" className="hover:text-slate-300">
                Profile
              </Link>
            )}
          </nav>
          <div>
            {session ? (
              <Button
                variant="outline"
                onClick={() => signOut()}
                className="text-white hover:text-slate-300"
              >
                Sign Out
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => signIn("github")}
                className="text-white hover:text-slate-300"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-slate-800 text-white p-4">
        <div className="container mx-auto text-center">
          <p>&copy; {new Date().getFullYear()} Unified Contribution Navigator</p>
        </div>
      </footer>
    </div>
  );
} 