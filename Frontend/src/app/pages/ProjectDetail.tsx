import { useParams, useNavigate } from "react-router";
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { StatusBadge } from "../components/StatusBadge";
import { 
  ArrowLeft, 
  Edit, 
  Upload, 
  Send, 
  Calendar, 
  User, 
  Users, 
  GitBranch, 
  FileText,
  MessageSquare,
  Download
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { ApiError } from "../api/client";
import { getProjectById, listProjectMembers, submitProject } from "../api/projectApi";
import { downloadProjectDocument, listProjectDocuments, uploadProjectDocument } from "../api/documentApi";
import { listProjectReviews } from "../api/reviewApi";
import { getCurrentUser } from "../api/session";
import type { BackendProject, DocumentVersion, ProjectMember, Review } from "../api/types";

export function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<BackendProject | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [documents, setDocuments] = useState<DocumentVersion[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);
  const [downloadingDocumentId, setDownloadingDocumentId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const projectId = Number(id);

  useEffect(() => {
    if (!Number.isFinite(projectId)) {
      setError("Invalid project id");
      setIsLoading(false);
      return;
    }

    const loadProjectData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [projectResponse, membersResponse, documentsResponse, reviewsResponse] = await Promise.all([
          getProjectById(projectId),
          listProjectMembers(projectId),
          listProjectDocuments(projectId),
          listProjectReviews(projectId),
        ]);

        setProject(projectResponse);
        setMembers(membersResponse);
        setDocuments(documentsResponse);
        setReviews(reviewsResponse);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Failed to load project details");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProjectData();
  }, [projectId]);

  const technologyStack = useMemo(() => {
    if (!project?.technologyStack) return [];
    return project.technologyStack
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }, [project?.technologyStack]);

  const normalizedStatus = (project?.status ?? "").toUpperCase();
  const currentUser = getCurrentUser();
  const isLeader = members.some(
    (member) => member.memberRole === 'LEADER' && member.user?.id === currentUser?.id
  );
  const isMember = members.some((member) => member.user?.id === currentUser?.id);
  const isReviewer = currentUser?.role === 'REVIEWER';
  const canUploadDocument =
    currentUser?.role === 'CONTRIBUTOR' &&
    (normalizedStatus === 'DRAFT' || normalizedStatus === 'UNDER_REVIEW');
  const canEdit =
    (isLeader && (normalizedStatus === 'DRAFT' || normalizedStatus === 'REJECTED' || normalizedStatus === 'UNDER_REVIEW')) ||
    (!isLeader && isMember && normalizedStatus === 'UNDER_REVIEW');
  const canSubmit =
    !isReviewer &&
    isMember &&
    (normalizedStatus === 'DRAFT' || normalizedStatus === 'REJECTED' || normalizedStatus === 'UNDER_REVIEW');

  const handleSubmitProject = async () => {
    if (!project) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await submitProject(project.id, crypto.randomUUID());
      const updatedProject = await getProjectById(project.id);
      setProject(updatedProject);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to submit project");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadDocument = async (file: File) => {
    if (!project) {
      return;
    }

    setError(null);
    setIsUploadingDocument(true);

    try {
      await uploadProjectDocument(project.id, file);
      const refreshed = await listProjectDocuments(project.id);
      setDocuments(refreshed);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to upload document");
      }
    } finally {
      setIsUploadingDocument(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerDocumentPicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    await handleUploadDocument(selectedFile);
  };

  const handleDownloadDocument = async (doc: DocumentVersion) => {
    if (!project) {
      return;
    }

    setError(null);
    setDownloadingDocumentId(doc.id);

    try {
      await downloadProjectDocument(project.id, doc.id, doc.fileName);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to download document");
      }
    } finally {
      setDownloadingDocumentId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12 text-gray-600">Loading project details...</div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h1 className="text-2xl font-semibold text-gray-900">Project not found</h1>
        <Button onClick={() => navigate("/")} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-semibold text-gray-900">{project.title}</h1>
              <StatusBadge status={project.status} />
            </div>
            <p className="text-gray-600">
              {project.department} • {project.academicYear}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {canEdit && (
            <Button variant="outline" className="gap-2" onClick={() => navigate(`/project/${project.id}/edit`)}>
              <Edit className="w-4 h-4" />
              Edit
            </Button>
          )}
          {canSubmit && (
            <Button className="gap-2" onClick={handleSubmitProject} disabled={isSubmitting}>
              <Send className="w-4 h-4" />
              {isSubmitting ? "Submitting..." : "Submit for Review"}
            </Button>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Abstract */}
          <Card>
            <CardHeader>
              <CardTitle>Abstract</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{project.abstractText}</p>
            </CardContent>
          </Card>

          {/* Technology Stack */}
          <Card>
            <CardHeader>
              <CardTitle>Technology Stack</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {technologyStack.map((tech, index) => (
                  <Badge key={index} variant="secondary">
                    {tech}
                  </Badge>
                ))}
                {technologyStack.length === 0 && <p className="text-sm text-gray-500">No technologies added</p>}
              </div>
            </CardContent>
          </Card>

          {/* Document Versions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Document Versions</CardTitle>
                <CardDescription>Uploaded project documents and reports</CardDescription>
              </div>
              {canUploadDocument && (
                <Button size="sm" className="gap-2" onClick={triggerDocumentPicker} disabled={isUploadingDocument}>
                  <Upload className="w-4 h-4" />
                  {isUploadingDocument ? "Uploading..." : "Upload"}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {canUploadDocument && (
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileInputChange}
                />
              )}
              {documents.length > 0 ? (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">{doc.fileName}</p>
                            <Badge variant="outline" className="text-xs">
                              v{doc.versionNumber}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {doc.uploadedBy?.name ?? 'Unknown'} • {new Date(doc.uploadedAt).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadDocument(doc)}
                        disabled={downloadingDocumentId === doc.id}
                      >
                        {downloadingDocumentId === doc.id ? "..." : <Download className="w-4 h-4" />}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No documents uploaded yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reviews & Feedback */}
          <Card>
            <CardHeader>
              <CardTitle>Reviews & Feedback</CardTitle>
              <CardDescription>Comments from faculty reviewers</CardDescription>
            </CardHeader>
            <CardContent>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-medium text-gray-900">{review.reviewer?.name ?? 'Reviewer'}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(review.createdAt).toLocaleDateString('en-US', { 
                              month: 'long', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={
                            review.decision === 'APPROVE' 
                              ? 'bg-green-50 text-green-700 border-green-200' 
                              : review.decision === 'REJECT'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          }
                        >
                          {review.decision === 'REQUEST_CHANGES' ? 'Needs Revision' : review.decision}
                        </Badge>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No reviews yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <User className="w-4 h-4" />
                  <span className="font-medium">Project Owner</span>
                </div>
                <p className="text-gray-900 ml-6">{members.find((m) => m.memberRole === 'LEADER')?.user?.name ?? 'N/A'}</p>
              </div>

              <Separator />

              <div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">Timeline</span>
                </div>
                <div className="ml-6 space-y-1 text-sm">
                  <p className="text-gray-600">
                    Created: {new Date(project.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </p>
                  <p className="text-gray-600">
                    Updated: {new Date(project.lastModifiedAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
              </div>

              {project.gitRepositoryUrl && (
                <>
                  <Separator />
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <GitBranch className="w-4 h-4" />
                      <span className="font-medium">Repository</span>
                    </div>
                    <a 
                      href={project.gitRepositoryUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-6 text-sm text-blue-600 hover:underline break-all"
                    >
                      View on GitHub
                    </a>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-700">
                        {member.user.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{member.user.name}</span>
                    {member.memberRole === 'LEADER' && <Badge variant="outline">Leader</Badge>}
                  </div>
                ))}
                {members.length === 0 && <p className="text-sm text-gray-500">No members assigned</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}