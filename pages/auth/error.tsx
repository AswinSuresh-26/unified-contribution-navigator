import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';

export default function ErrorPage() {
  const router = useRouter();
  const { error } = router.query;

  const errors: { [key: string]: string } = {
    Configuration: "There is a problem with the server configuration. Check if your GitHub credentials are set correctly.",
    AccessDenied: "You do not have permission to sign in.",
    Verification: "The sign in link is no longer valid. It may have been used already or it may have expired.",
    default: "An error occurred while trying to sign in. Please try again.",
  };

  const errorMessage = error && typeof error === 'string' ? errors[error] ?? errors.default : errors.default;

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Authentication Error</h1>
        <p className="text-lg text-gray-600 mb-8 text-center max-w-2xl">
          {errorMessage}
        </p>
        <div className="space-x-4">
          <Button onClick={() => router.push('/login')}>
            Try Again
          </Button>
          <Button variant="outline" onClick={() => router.push('/')}>
            Go Home
          </Button>
        </div>
      </div>
    </Layout>
  );
} 