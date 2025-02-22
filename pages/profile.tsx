import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState, useEffect } from "react";
import ProjectCard from "@/components/ProjectCard";

interface UserRepo {
  id: string;
  name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  language: string;
  topics: string[];
  owner: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
}

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userRepos, setUserRepos] = useState<UserRepo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchUserRepos = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch(`https://api.github.com/user/repos`, {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
              Accept: 'application/vnd.github.v3+json',
            },
          });

          if (response.ok) {
            const repos = await response.json();
            setUserRepos(repos.map((repo: any) => ({
              id: repo.id.toString(),
              name: repo.name,
              description: repo.description || '',
              html_url: repo.html_url,
              stargazers_count: repo.stargazers_count,
              language: repo.language,
              topics: repo.topics || [],
              owner: {
                login: repo.owner.login,
                avatar_url: repo.owner.avatar_url,
                html_url: repo.owner.html_url
              }
            })));
          }
        } catch (error) {
          console.error('Error fetching user repositories:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUserRepos();
  }, [session]);

  if (status === "loading") {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <p className="text-gray-600">Loading...</p>
        </div>
      </Layout>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center space-x-4">
              {session.user?.image && (
                <Image
                  src={session.user.image}
                  alt={session.user?.name || 'Profile'}
                  width={100}
                  height={100}
                  className="rounded-full"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold">{session.user?.name}</h1>
                <p className="text-gray-600">{session.user?.email}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={() => window.open(`https://github.com/${session.user?.name}`, '_blank')}
              >
                View GitHub Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-bold mb-6">Your Repositories</h2>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading repositories...</p>
          </div>
        ) : userRepos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userRepos.map((repo) => (
              <ProjectCard
                key={repo.id}
                project={{
                  ...repo,
                  tags: [...(repo.language ? [repo.language] : []), ...repo.topics]
                }}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-600">No repositories found.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
} 