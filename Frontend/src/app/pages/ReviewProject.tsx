import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { StatusBadge } from "../components/StatusBadge";
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  User,
  Calendar,
  Users,
  GitBranch,
  FileText
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { ApiError } from "../api/client";
import { listProjectMembers, getProjectById } from "../api/projectApi";
import { downloadProjectDocument, listProjectDocuments } from "../api/documentApi";
import { listProjectReviews, submitReview } from "../api/reviewApi";
import type { BackendProject, DocumentVersion, ProjectMember, Review, ReviewDecision } from "../api/types";

export function ReviewProject() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [decision, setDecision] = useState<ReviewDecision | "">("");
  const [comments, setComments] = useState("");
  const [project, setProject] = useState<BackendProject | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [documents, setDocuments] = useState<DocumentVersion[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [downloadingDocumentId, setDownloadingDocumentId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const projectId = Number(id);

  useEffect(() => {
    if (!Number.isFinite(projectId)) {
      setError("Invalid project id");
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
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
          setError("Failed to load review data");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [projectId]);

  const technologyStack = useMemo(() => {
    if (!project?.technologyStack) return [];
    return project.technologyStack
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
  }, [project?.technologyStack]);

  const normalizedStatus = (project?.status ?? '').toUpperCase();
  const canReview = normalizedStatus === 'SUBMITTED';

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

  const handleDecisionChange = (value: string) => {
    setDecision(value as ReviewDecision | "");
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12 text-gray-600">Loading project for review...</div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h1 className="text-2xl font-semibold text-gray-900">Project not found</h1>
        <Button onClick={() => navigate("/reviewer")} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const handleSubmitReview = async () => {
    if (!decision || !comments.trim()) {
      setError("Please select a decision and provide comments");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await submitReview(project.id, {
        decision,
        comment: comments.trim(),
      });
      navigate("/reviewer");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to submit review");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-semibold text-gray-900">Review Project</h1>
            <StatusBadge status={project.status} />
          </div>
          <p className="text-gray-600">
            Evaluate the project and provide your feedback
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{project.title}</CardTitle>
              <CardDescription>
                {project.department} • {project.academicYear}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Abstract</h3>
                <p className="text-gray-700 leading-relaxed">{project.abstractText}</p>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Technology Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {technologyStack.map((tech, index) => (
                    <Badge key={index} variant="secondary">
                      {tech}
                    </Badge>
                  ))}
                  {technologyStack.length === 0 && <p className="text-sm text-gray-500">No technologies listed</p>}
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">Project Leader</p>
                  <p className="font-medium text-gray-900">{members.find((m) => m.memberRole === 'LEADER')?.user.name ?? 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Team Size</p>
                  <p className="font-medium text-gray-900">{members.length} members</p>
                </div>
              </div>

              {project.gitRepositoryUrl && (
                <>
                  <Separator />
                  <div>
                    <p className="text-gray-600 mb-1 text-sm">Git Repository</p>
                    <a 
                      href={project.gitRepositoryUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline break-all"
                    >
                      {project.gitRepositoryUrl}
                    </a>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Submitted Documents</CardTitle>
              <CardDescription>Project reports and documentation</CardDescription>
            </CardHeader>
            <CardContent>
              {documents.length > 0 ? (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
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
                            {doc.uploadedBy?.name ?? 'Unknown'} • {new Date(doc.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadDocument(doc)}
                        disabled={downloadingDocumentId === doc.id}
                      >
                        {downloadingDocumentId === doc.id ? "Downloading..." : "Download"}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No documents uploaded</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Previous Reviews */}
          {reviews.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Previous Reviews</CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          )}
        </div>

        {/* Review Decision Sidebar */}
        <div className="space-y-6">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Submit Review</CardTitle>
              <CardDescription>Make your decision and provide feedback</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Decision *</Label>
                <RadioGroup value={decision} onValueChange={handleDecisionChange}>
                  <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="APPROVE" id="approved" />
                    <Label htmlFor="approved" className="flex items-center gap-2 cursor-pointer flex-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Approve</span>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="REQUEST_CHANGES" id="changes" />
                    <Label htmlFor="changes" className="flex items-center gap-2 cursor-pointer flex-1">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      <span>Needs Revision</span>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="REJECT" id="rejected" />
                    <Label htmlFor="rejected" className="flex items-center gap-2 cursor-pointer flex-1">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span>Reject</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comments">Comments *</Label>
                <Textarea
                  id="comments"
                  placeholder="Provide detailed feedback for the team..."
                  rows={8}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Your comments will be visible to the project team
                </p>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <Button 
                className="w-full" 
                size="lg" 
                onClick={handleSubmitReview}
                disabled={!decision || !comments.trim() || !canReview || isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>

              {!canReview && (
                <p className="text-xs text-amber-600">This project is not currently in a reviewable state.</p>
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
                  </div>
                ))}
                {members.length === 0 && <p className="text-sm text-gray-500">No team members found</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
