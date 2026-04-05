import { apiRequest } from './client';
import type { BackendProject, CreateProjectRequest, PageResponse, ProjectMember, ProjectStatus, UiProject } from './types';

function parseTechnologyStack(technologyStack?: string): string[] {
  if (!technologyStack) {
    return [];
  }

  return technologyStack
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function mapBackendProjectToUiProject(project: BackendProject): UiProject {
  return {
    id: String(project.id),
    title: project.title,
    abstract: project.abstractText,
    department: project.department,
    academicYear: project.academicYear,
    technologyStack: parseTechnologyStack(project.technologyStack),
    facultyGuide: project.facultyGuide?.name,
    teamMembers: [],
    status: project.status,
    updatedAt: project.lastModifiedAt || project.createdAt,
  };
}

export function createProject(payload: CreateProjectRequest): Promise<BackendProject> {
  return apiRequest<BackendProject>('/projects', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateProject(projectId: number, payload: CreateProjectRequest): Promise<BackendProject> {
  return apiRequest<BackendProject>(`/projects/${projectId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function submitProject(projectId: number, idempotencyKey: string): Promise<string> {
  return apiRequest<string>(`/projects/${projectId}/submit`, {
    method: 'POST',
    headers: {
      'Idempotency-Key': idempotencyKey,
    },
  });
}

export function getProjectById(projectId: number): Promise<BackendProject> {
  return apiRequest<BackendProject>(`/projects/${projectId}`, {
    method: 'GET',
  });
}

export function listProjects(status?: ProjectStatus, page = 0, size = 20): Promise<PageResponse<BackendProject>> {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('size', String(size));

  if (status) {
    params.set('status', status);
  }

  return apiRequest<PageResponse<BackendProject>>(`/projects?${params.toString()}`, {
    method: 'GET',
  });
}

export function searchProjects(filters: {
  status?: ProjectStatus;
  department?: string;
  academicYear?: string;
  keyword?: string;
  page?: number;
  size?: number;
}): Promise<PageResponse<BackendProject>> {
  const params = new URLSearchParams();

  if (filters.status) params.set('status', filters.status);
  if (filters.department) params.set('department', filters.department);
  if (filters.academicYear) params.set('academicYear', filters.academicYear);
  if (filters.keyword) params.set('keyword', filters.keyword);

  params.set('page', String(filters.page ?? 0));
  params.set('size', String(filters.size ?? 20));

  return apiRequest<PageResponse<BackendProject>>(`/projects/search?${params.toString()}`, {
    method: 'GET',
  });
}

export function listProjectMembers(projectId: number): Promise<ProjectMember[]> {
  return apiRequest<ProjectMember[]>(`/projects/${projectId}/members`, {
    method: 'GET',
  });
}
