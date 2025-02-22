import { useSession } from "next-auth/react";
import Layout from "@/components/Layout";
import ProjectCard from "@/components/ProjectCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { Project } from "@prisma/client";

export default function Home() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([
    {
      id: "1",
      name: "Example Project 1",
      description: "A sample project to demonstrate the UI",
      tags: ["JavaScript", "React", "Node.js"],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "2",
      name: "Example Project 2",
      description: "Another sample project with different technologies",
      tags: ["TypeScript", "Next.js", "PostgreSQL"],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Open Source Projects</h1>
          {session && (
            <Button variant="outline">
              Add Project
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {!projects.length && (
          <Card className="mt-8">
            <CardContent className="text-center py-12">
              <p className="text-gray-600">No projects found.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
} 