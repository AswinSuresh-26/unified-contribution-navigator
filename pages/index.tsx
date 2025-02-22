import { useSession } from "next-auth/react";
import Layout from "@/components/Layout";
import ProjectCard from "@/components/ProjectCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useDebounce } from "@/lib/hooks";

interface GitHubRepo {
  id: string;
  name: string;
  description: string;
  tags: string[];
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

export default function Home() {
  const { data: session } = useSession();
  const [repositories, setRepositories] = useState<GitHubRepo[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const debouncedSearch = useDebounce(searchQuery, 300);

  const fetchRepositories = async (pageNum: number, search?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        page: pageNum.toString(),
        per_page: '30'
      });

      if (search) {
        queryParams.set('query', search);
      }

      const response = await fetch(`/api/github/repositories?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch repositories');
      }

      const data = await response.json();
      
      const newRepos = data.items.map((repo: any) => ({
        id: repo.id.toString(),
        name: repo.name,
        description: repo.description || '',
        tags: repo.topics || [],
        html_url: repo.html_url,
        stargazers_count: repo.stargazers_count,
        language: repo.language,
        topics: repo.topics || [],
        owner: {
          login: repo.owner.login,
          avatar_url: repo.owner.avatar_url,
          html_url: repo.owner.html_url
        }
      }));

      if (pageNum === 1) {
        setRepositories(newRepos);
      } else {
        setRepositories(prev => [...prev, ...newRepos]);
      }

      setHasMore(newRepos.length > 0);
    } catch (error) {
      console.error('Error fetching repositories:', error);
      setError('Failed to fetch repositories. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchRepositories(1, debouncedSearch);
  }, [debouncedSearch]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchRepositories(nextPage, debouncedSearch);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col space-y-4 mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Open Source Projects</h1>
            {session && (
              <Button variant="outline">
                Add Project
              </Button>
            )}
          </div>
          
          <div className="w-full max-w-2xl mx-auto">
            <Input
              type="search"
              placeholder="Search repositories by name, description, language, topics, or owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {error && (
          <Card className="mb-8">
            <CardContent className="text-center py-4">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {isLoading && repositories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading repositories...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {repositories.map((repo) => (
                <ProjectCard
                  key={repo.id}
                  project={{
                    ...repo,
                    tags: [...(repo.language ? [repo.language] : []), ...repo.topics]
                  }}
                />
              ))}
            </div>

            {hasMore && (
              <div className="text-center mt-8">
                <Button
                  onClick={loadMore}
                  variant="outline"
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
          </>
        )}

        {!isLoading && repositories.length === 0 && (
          <Card className="mt-8">
            <CardContent className="text-center py-12">
              <p className="text-gray-600">No repositories found matching your search.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
} 