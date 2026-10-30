import api from "./axios";
import type { ApiResponse } from "./types";

export interface TrackActivityPayload {
  visitorId: string;
  sessionId: string;
  activityType: string;
  pagePath?: string;
  pageTitle?: string;
  productId?: string;
  productSlug?: string;
  searchQuery?: string;
  orderId?: string;
  cookieConsent?: boolean;
  metadata?: Record<string, unknown>;
  duration?: number;
}

// POST /api/activity/track (public)
export async function trackActivityApi(payload: TrackActivityPayload) {
  const res = await api.post<ApiResponse<unknown>>("/activity/track", payload);
  return res.data.data;
}

// ---- Admin ----

// GET /api/activity/analytics?startDate=&endDate=
export async function getActivityAnalyticsApi(params?: { startDate?: string; endDate?: string }) {
  const res = await api.get<ApiResponse<any>>("/activity/analytics", { params });
  return res.data.data;
}

// GET /api/activity/recent?limit=&page=
export async function getRecentActivitiesApi(params?: { limit?: number; page?: number }) {
  const res = await api.get<ApiResponse<any>>("/activity/recent", { params });
  return res.data.data;
}

// GET /api/activity/visitor/:visitorId
export async function getVisitorJourneyApi(visitorId: string) {
  const res = await api.get<ApiResponse<any>>(`/activity/visitor/${visitorId}`);
  return res.data.data;
}
