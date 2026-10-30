import api from "./axios";
import type { ApiResponse, SiteSettings } from "./types";

// GET /api/settings (public)
export async function getSettingsApi() {
  const res = await api.get<ApiResponse<{ settings: SiteSettings }>>("/settings");
  return res.data.data.settings;
}

// ---- Admin ----

// GET /api/settings/admin
export async function getSettingsAdminApi() {
  const res = await api.get<ApiResponse<{ settings: SiteSettings }>>("/settings/admin");
  return res.data.data.settings;
}

// PATCH /api/settings
export async function updateSettingsApi(input: Partial<SiteSettings>) {
  const res = await api.patch<ApiResponse<{ settings: SiteSettings }>>("/settings", input);
  return res.data.data.settings;
}

// POST /api/settings/reset
export async function resetSettingsApi() {
  const res = await api.post<ApiResponse<{ settings: SiteSettings }>>("/settings/reset");
  return res.data.data.settings;
}
