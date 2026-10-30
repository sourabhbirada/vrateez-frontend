import api from "./axios";
import type { ApiResponse, Category } from "./types";

// GET /api/categories (public, active only)
export async function getCategoriesApi() {
  const res = await api.get<ApiResponse<{ items: Category[] }>>("/categories");
  return res.data.data.items;
}

// ---- Admin ----

// GET /api/categories/admin (all, including inactive)
export async function getCategoriesAdminApi() {
  const res = await api.get<ApiResponse<{ items: Category[] }>>("/categories/admin");
  return res.data.data.items;
}

// POST /api/categories
export async function createCategoryApi(input: Partial<Category>) {
  const res = await api.post<ApiResponse<{ category: Category }>>("/categories", input);
  return res.data.data.category;
}

// PATCH /api/categories/:id
export async function updateCategoryApi(id: string, input: Partial<Category>) {
  const res = await api.patch<ApiResponse<{ category: Category }>>(`/categories/${id}`, input);
  return res.data.data.category;
}

// DELETE /api/categories/:id
export async function deleteCategoryApi(id: string) {
  const res = await api.delete<ApiResponse<unknown>>(`/categories/${id}`);
  return res.data;
}
