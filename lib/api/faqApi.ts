import api from "./axios";
import type { ApiResponse, Faq } from "./types";

// GET /api/faqs (public, active only)
export async function getFaqsApi() {
  const res = await api.get<ApiResponse<{ items: Faq[] }>>("/faqs");
  return res.data.data.items;
}

// ---- Admin ----

// GET /api/faqs/admin (all, including inactive)
export async function getFaqsAdminApi() {
  const res = await api.get<ApiResponse<{ items: Faq[] }>>("/faqs/admin");
  return res.data.data.items;
}

// POST /api/faqs
export async function createFaqApi(input: Partial<Faq>) {
  const res = await api.post<ApiResponse<{ faq: Faq }>>("/faqs", input);
  return res.data.data.faq;
}

// PATCH /api/faqs/:id
export async function updateFaqApi(id: string, input: Partial<Faq>) {
  const res = await api.patch<ApiResponse<{ faq: Faq }>>(`/faqs/${id}`, input);
  return res.data.data.faq;
}

// DELETE /api/faqs/:id
export async function deleteFaqApi(id: string) {
  const res = await api.delete<ApiResponse<unknown>>(`/faqs/${id}`);
  return res.data;
}
