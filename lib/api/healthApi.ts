import api from "./axios";
import type { ApiResponse } from "./types";

// GET /api/health
export async function healthApi() {
  const res = await api.get<ApiResponse<unknown>>("/health");
  return res.data;
}
