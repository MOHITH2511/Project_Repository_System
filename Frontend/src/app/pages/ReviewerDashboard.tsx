import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { departments } from "../constants/options";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Search,
  Filter
} from "lucide-react";
import { StatusBadge } from "../components/StatusBadge";
import { Badge } from "../components/ui/badge";
import { ApiError } from "../api/client";
import { listProjects, mapBackendProjectToUiProject } from "../api/projectApi";
import type { UiProject } from "../api/types";

export function ReviewerDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusView, setStatusView] = useState("reviewQueue");
  const [allProjects, setAllProjects] = useState<UiProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await listProjects(undefined, 0, 200);
        setAllProjects(response.content.map(mapBackendProjectToUiProject));
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('Failed to load projects for review');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    const statusFiltered = allProjects.filter((project) => {
      const status = project.status.toUpperCase();

      if (statusView === 'reviewQueue') {
        return status === 'DRAFT' || status === 'SUBMITTED' || status === 'UNDER_REVIEW';
      }

      if (statusView === 'approved') {
        return status === 'APPROVED';
      }

      if (statusView === 'rejected') {
        return status === 'REJECTED';
      }

      if (statusView === 'changesRequested') {
        return status === 'UNDER_REVIEW';
      }

      return true;
    });

    return statusFiltered.filter((project) => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.abstract.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDepartment = departmentFilter === "all" || project.department === departmentFilter;
      return matchesSearch && matchesDepartment;
    });
  }, [allProjects, statusView, searchQuery, departmentFilter]);

  const pendingProjects = useMemo(
    () => allProjects.filter((p) => {
      const status = p.status.toUpperCase();
      return status === 'DRAFT' || status === 'SUBMITTED' || status === 'UNDER_REVIEW';
    }),
    [allProjects]
  );

  const stats = {
    pending: pendingProjects.length,
    approved: allProjects.filter(p => p.status.toUpperCase() === 'APPROVED').length,
    rejected: allProjects.filter(p => p.status.toUpperCase() === 'REJECTED').length,
    changesRequested: allProjects.filter(p => p.status.toUpperCase() === 'UNDER_REVIEW').length,
  };

  const sectionTitle =
    statusView === 'reviewQueue'
      ? 'Projects in Review Queue'
      : statusView === 'approved'
      ? 'Approved Projects'
      : statusView === 'rejected'
      ? 'Rejected Projects'
      : statusView === 'changesRequested'
      ? 'Projects Needing Revision'
      : 'All Projects';

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Review Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Evaluate and provide feedback on submitted projects
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending Review</CardDescription>
            <CardTitle className="text-3xl">{stats.pending}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-yellow-600">
              <Clock className="w-4 h-4 mr-2" />
              Draft + submitted + under review
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
              All time
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Changes Requested</CardDescription>
            <CardTitle className="text-3xl">{stats.changesRequested}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-orange-600">
              <AlertCircle className="w-4 h-4 mr-2" />
              Needs revision
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Rejected</CardDescription>
            <CardTitle className="text-3xl">{stats.rejected}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-red-600">
              <XCircle className="w-4 h-4 mr-2" />
              All time
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger>
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusView} onValueChange={setStatusView}>
              <SelectTrigger>
                <SelectValue placeholder="Status View" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reviewQueue">Review Queue (Draft + Submitted + Under Review)</SelectItem>
                <SelectItem value="changesRequested">Needs Revision</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="all">All Statuses</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Projects List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {sectionTitle} ({filteredProjects.length})
          </h2>
        </div>

        {isLoading && (
          <Card>
            <CardContent className="py-12 text-center text-gray-600">Loading review queue...</CardContent>
          </Card>
        )}

        {!isLoading && error && (
          <Card>
            <CardContent className="py-12 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load projects</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
            </CardContent>
          </Card>
        )}
        
        {!isLoading && !error && filteredProjects.length > 0 ? (
          <div className="space-y-4">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                          {project.title}
                        </h3>
                        <StatusBadge status={project.status} />
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {project.abstract}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                        <span>{project.department}</span>
                        <span>•</span>
                        <span>{project.academicYear}</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {project.technologyStack.slice(0, 4).map((tech, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                        {project.technologyStack.length > 4 && (
                          <Badge variant="secondary" className="text-xs">
                            +{project.technologyStack.length - 4}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {project.status.toUpperCase() === 'SUBMITTED' && (
                        <Link to={`/review/${project.id}`}>
                          <Button className="whitespace-nowrap">
                            Review Project
                          </Button>
                        </Link>
                      )}
                      <Link to={`/project/${project.id}`}>
                        <Button variant="outline" className="whitespace-nowrap">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}

        {!isLoading && !error && filteredProjects.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No projects to review
              </h3>
              <p className="text-gray-600">
                All submitted projects have been reviewed
              </p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}