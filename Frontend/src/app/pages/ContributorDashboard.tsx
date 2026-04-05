import { Link, useNavigate } from "react-router";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ProjectCard } from "../components/ProjectCard";
import { 
  Plus, 
  FileText, 
  Clock, 
  CheckCircle, 
  FolderOpen 
} from "lucide-react";
import { listProjectMembers, listProjects, mapBackendProjectToUiProject } from "../api/projectApi";
import type { UiProject } from "../api/types";
import { ApiError } from "../api/client";
import { getCurrentUser } from "../api/session";

export function ContributorDashboard() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<UiProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const currentUser = getCurrentUser();
        if (!currentUser) {
          setProjects([]);
          return;
        }

        const response = await listProjects(undefined, 0, 100);
        const ownProjects = await Promise.all(
          response.content.map(async (project) => {
            try {
              const members = await listProjectMembers(project.id);
              const isMine = members.some((member) => member.user?.id === currentUser.id);
              return isMine ? project : null;
            } catch {
              return null;
            }
          })
        );

        setProjects(
          ownProjects
            .filter((project): project is NonNullable<typeof project> => project !== null)
            .map(mapBackendProjectToUiProject)
        );
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Failed to load projects");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, []);

  const myProjects = useMemo(() => projects, [projects]);

  const isDraftStatus = (status: string) => status.toUpperCase() === "DRAFT";
  const isSubmittedOrUnderReview = (status: string) => {
    const normalized = status.toUpperCase();
    return normalized === "SUBMITTED" || normalized === "UNDER_REVIEW";
  };
  const isApprovedStatus = (status: string) => status.toUpperCase() === "APPROVED";

  const stats = {
    total: myProjects.length,
    draft: myProjects.filter(p => isDraftStatus(p.status)).length,
    submitted: myProjects.filter(p => isSubmittedOrUnderReview(p.status)).length,
    approved: myProjects.filter(p => isApprovedStatus(p.status)).length,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">My Projects</h1>
          <p className="text-gray-600 mt-1">
            Manage and track your academic projects
          </p>
        </div>
        <Button size="lg" className="gap-2" onClick={() => navigate('/project/create')}>
          <Plus className="w-5 h-5" />
          Create New Project
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Projects</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-gray-600">
              <FolderOpen className="w-4 h-4 mr-2" />
              All projects
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Drafts</CardDescription>
            <CardTitle className="text-3xl">{stats.draft}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-gray-600">
              <FileText className="w-4 h-4 mr-2" />
              Not yet submitted
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>In Review</CardDescription>
            <CardTitle className="text-3xl">{stats.submitted}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              Awaiting feedback
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Approved</CardDescription>
            <CardTitle className="text-3xl">{stats.approved}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-green-600">
              <CheckCircle className="w-4 h-4 mr-2" />
              Completed
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Recent Projects
        </h2>
        {isLoading && (
          <Card>
            <CardContent className="py-12 text-center text-gray-600">
              Loading projects...
            </CardContent>
          </Card>
        )}

        {!isLoading && error && (
          <Card>
            <CardContent className="py-12 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load projects</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && myProjects.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {myProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : null}

        {!isLoading && !error && myProjects.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No projects yet
              </h3>
              <p className="text-gray-600 mb-6">
                Get started by creating your first project
              </p>
              <Link to="/project/create">
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Project
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}