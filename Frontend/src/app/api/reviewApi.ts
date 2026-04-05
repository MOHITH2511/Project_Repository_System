import { apiRequest } from './client';
import type { Review, ReviewDecision } from './types';

export function listProjectReviews(projectId: number): Promise<Review[]> {
  return apiRequest<Review[]>(`/reviews/project/${projectId}`, {
    method: 'GET',
  });
}

export function submitReview(projectId: number, payload: {
  decision: ReviewDecision;
  comment: string;
  reviewerId?: number;
}): Promise<Review> {
  return apiRequest<Review>(`/reviews/${projectId}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
