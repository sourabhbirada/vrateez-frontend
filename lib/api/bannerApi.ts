import api from "./axios";
import type { ApiResponse, Banner } from "./types";

// GET /api/banners (public, active only)
export async function getBannersApi() {
  const res = await api.get<ApiResponse<{ items: Banner[] }>>("/banners");
  return res.data.data.items;
}

// ---- Admin ----

// GET /api/banners/admin (all, including inactive)
export async function getBannersAdminApi() {
  const res = await api.get<ApiResponse<{ items: Banner[] }>>("/banners/admin");
  return res.data.data.items;
}

// POST /api/banners
export async function createBannerApi(input: Partial<Banner>) {
  const res = await api.post<ApiResponse<{ banner: Banner }>>("/banners", input);
  return res.data.data.banner;
}

// PATCH /api/banners/:id
export async function updateBannerApi(id: string, input: Partial<Banner>) {
  const res = await api.patch<ApiResponse<{ banner: Banner }>>(`/banners/${id}`, input);
  return res.data.data.banner;
}

// DELETE /api/banners/:id
export async function deleteBannerApi(id: string) {
  const res = await api.delete<ApiResponse<unknown>>(`/banners/${id}`);
  return res.data;
}
