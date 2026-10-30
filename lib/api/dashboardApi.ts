import api from "./axios";
import type { ApiResponse } from "./types";

// GET /api/dashboard/stats (admin)
export async function getDashboardStatsApi() {
  const res = await api.get<ApiResponse<any>>("/dashboard/stats");
  return res.data.data;
}
