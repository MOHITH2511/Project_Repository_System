import { apiRequest } from './client';
import type { AdminMetrics } from './types';

export function getAdminMetrics(): Promise<AdminMetrics> {
  return apiRequest<AdminMetrics>('/admin/metrics', {
    method: 'GET',
  });
}
