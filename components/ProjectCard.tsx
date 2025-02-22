import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarIcon } from "@heroicons/react/24/solid";
import Image from "next/image";

interface Project {
  id: string;
  name: string;
  description: string;
  tags: string[];
  html_url: string;
  stargazers_count: number;
  language: string;
  owner: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
}

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex-none">
        <div className="flex items-center space-x-3 mb-2">
          <a 
            href={project.owner.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 hover:underline"
          >
            <Image
              src={project.owner.avatar_url}
              alt={`${project.owner.login}'s avatar`}
              width={24}
              height={24}
              className="rounded-full"
            />
            <span className="text-sm text-gray-600">{project.owner.login}</span>
          </a>
        </div>
        <a
          href={project.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-lg font-semibold hover:text-blue-600 transition-colors duration-200"
        >
          {project.name}
        </a>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
          {project.description || 'No description available'}
        </p>
        
        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
            <span>{project.stargazers_count.toLocaleString()}</span>
          </div>
          {project.language && (
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-blue-500 mr-1"></span>
              <span>{project.language}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex-none">
        <div className="flex flex-wrap gap-2">
          {project.tags.slice(0, 4).map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {project.tags.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{project.tags.length - 4} more
            </Badge>
          )}
        </div>
      </CardFooter>
    </Card>
  );
} 