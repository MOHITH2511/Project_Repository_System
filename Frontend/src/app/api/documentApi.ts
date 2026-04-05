import { apiRequest } from './client';
import { getToken } from './session';
import type { DocumentVersion } from './types';

export function listProjectDocuments(projectId: number): Promise<DocumentVersion[]> {
  return apiRequest<DocumentVersion[]>(`/documents/${projectId}`, {
    method: 'GET',
  });
}

export function uploadProjectDocument(projectId: number, file: File): Promise<DocumentVersion> {
  const formData = new FormData();
  formData.append('file', file);

  return apiRequest<DocumentVersion>(`/documents/${projectId}/upload`, {
    method: 'POST',
    body: formData,
  });
}

export async function downloadProjectDocument(projectId: number, documentId: number, fileName: string): Promise<void> {
  const token = getToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`/api/documents/${projectId}/${documentId}/download`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to download document (${response.status})`);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = window.document.createElement('a');
  link.href = url;
  link.download = fileName;
  window.document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
