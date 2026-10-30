import api from "./axios";
import type { ApiResponse, Testimonial } from "./types";

// GET /api/testimonials (public, active only)
export async function getTestimonialsApi() {
  const res = await api.get<ApiResponse<{ items: Testimonial[] }>>("/testimonials");
  return res.data.data.items;
}

// ---- Admin ----

// GET /api/testimonials/admin (all, including inactive)
export async function getTestimonialsAdminApi() {
  const res = await api.get<ApiResponse<{ items: Testimonial[] }>>("/testimonials/admin");
  return res.data.data.items;
}

// POST /api/testimonials
export async function createTestimonialApi(input: Partial<Testimonial>) {
  const res = await api.post<ApiResponse<{ testimonial: Testimonial }>>("/testimonials", input);
  return res.data.data.testimonial;
}

// PATCH /api/testimonials/:id
export async function updateTestimonialApi(id: string, input: Partial<Testimonial>) {
  const res = await api.patch<ApiResponse<{ testimonial: Testimonial }>>(`/testimonials/${id}`, input);
  return res.data.data.testimonial;
}

// DELETE /api/testimonials/:id
export async function deleteTestimonialApi(id: string) {
  const res = await api.delete<ApiResponse<unknown>>(`/testimonials/${id}`);
  return res.data;
}
