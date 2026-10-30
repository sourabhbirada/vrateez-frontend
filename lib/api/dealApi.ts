import api from "./axios";
import type { ApiResponse, Deal } from "./types";

// GET /api/deals?placement= (public, active only)
export async function getDealsApi(placement?: "homepage" | "landing") {
  const res = await api.get<ApiResponse<{ items: Deal[] }>>("/deals", {
    params: placement ? { placement } : undefined,
  });
  return res.data.data.items;
}

// ---- Admin ----

// GET /api/deals/admin (all, including inactive)
export async function getDealsAdminApi() {
  const res = await api.get<ApiResponse<{ items: Deal[] }>>("/deals/admin");
  return res.data.data.items;
}

// POST /api/deals
export async function createDealApi(input: Partial<Deal>) {
  const res = await api.post<ApiResponse<{ deal: Deal }>>("/deals", input);
  return res.data.data.deal;
}

// PATCH /api/deals/:id
export async function updateDealApi(id: string, input: Partial<Deal>) {
  const res = await api.patch<ApiResponse<{ deal: Deal }>>(`/deals/${id}`, input);
  return res.data.data.deal;
}

// DELETE /api/deals/:id
export async function deleteDealApi(id: string) {
  const res = await api.delete<ApiResponse<unknown>>(`/deals/${id}`);
  return res.data;
}
