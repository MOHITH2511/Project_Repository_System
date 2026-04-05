export type UserRole = 'CONTRIBUTOR' | 'REVIEWER' | 'ADMIN';

export type ProjectStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'ARCHIVED'
  | 'Draft'
  | 'Submitted'
  | 'Under Review'
  | 'Approved'
  | 'Rejected'
  | 'Archived';

export interface ApiErrorPayload {
  error?: string;
  message?: string;
  timestamp?: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  active: boolean;
  createdAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface CreateProjectRequest {
  title: string;
  abstractText: string;
  department: string;
  academicYear: string;
  technologyStack?: string;
  gitRepositoryUrl?: string;
  facultyGuideId?: number;
  teamMemberIds?: number[];
}

export interface BackendProject {
  id: number;
  title: string;
  abstractText: string;
  department: string;
  academicYear: string;
  technologyStack?: string;
  gitRepositoryUrl?: string;
  facultyGuide?: AuthUser;
  status: ProjectStatus;
  version?: number;
  createdAt: string;
  lastModifiedAt: string;
}

export interface ProjectMember {
  id: number;
  memberRole: 'LEADER' | 'CONTRIBUTOR';
  joinedAt: string;
  user: AuthUser;
}

export interface DocumentVersion {
  id: number;
  versionNumber: number;
  fileName: string;
  storagePath: string;
  uploadedAt: string;
  uploadedBy: AuthUser;
}

export type ReviewDecision = 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES';

export interface Review {
  id: number;
  decision: ReviewDecision;
  comment?: string;
  createdAt: string;
  reviewer: AuthUser;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements: number;
}

export interface UiProject {
  id: string;
  title: string;
  abstract: string;
  department: string;
  academicYear: string;
  technologyStack: string[];
  facultyGuide?: string;
  teamMembers: string[];
  status: ProjectStatus;
  updatedAt: string;
}

export interface AdminMetrics {
  storageUsedBytes: number;
  totalDocuments: number;
  projectsCreatedThisMonth: number;
}
