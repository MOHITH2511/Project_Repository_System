import { Link } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { StatusBadge } from "./StatusBadge";
import { Calendar, User, Users } from "lucide-react";
import { Badge } from "./ui/badge";
import type { ProjectStatus } from "../api/types";

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    abstract: string;
    department: string;
    academicYear: string;
    technologyStack: string[];
    status: ProjectStatus;
    updatedAt: string;
    facultyGuide?: string;
    teamMembers?: string[];
  };
  showActions?: boolean;
}

export function ProjectCard({ project, showActions = true }: ProjectCardProps) {
  return (
    <Link to={`/project/${project.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="line-clamp-1">{project.title}</CardTitle>
              <CardDescription className="mt-1.5">
                {project.department} • {project.academicYear}
              </CardDescription>
            </div>
            <StatusBadge status={project.status} />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 line-clamp-2 mb-4">
            {project.abstract}
          </p>
          
          <div className="space-y-2.5 text-sm">
            {project.facultyGuide && (
              <div className="flex items-center gap-2 text-gray-600">
                <User className="w-4 h-4" />
                <span>Guide: {project.facultyGuide}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="w-4 h-4" />
              <span>
                {(project.teamMembers?.length ?? 0)} team member{(project.teamMembers?.length ?? 0) !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Updated {new Date(project.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>

          {project.technologyStack.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {project.technologyStack.slice(0, 3).map((tech, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tech}
                </Badge>
              ))}
              {project.technologyStack.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{project.technologyStack.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
