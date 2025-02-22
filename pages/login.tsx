import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";

export default function Login() {
  const { data: session } = useSession();
  const router = useRouter();

  if (session) {
    router.push("/profile");
    return null;
  }

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-4xl font-bold mb-8">Welcome to Unified Contribution Navigator</h1>
        <p className="text-lg text-gray-600 mb-8 text-center max-w-2xl">
          Connect with your GitHub account to discover open source projects that match your skills
          and start contributing today.
        </p>
        <Button
          onClick={() => signIn("github")}
          className="text-lg px-8 py-6"
          size="lg"
        >
          Sign in with GitHub
        </Button>
      </div>
    </Layout>
  );
} 