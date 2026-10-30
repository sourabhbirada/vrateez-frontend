import api from "./axios";
import type { ApiResponse, Product } from "./types";

export interface ProductListData {
  items: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProductListParams {
  category?: string;
  q?: string;
  page?: number;
  limit?: number;
}

// GET /api/products
export async function getProductsApi(params?: ProductListParams) {
  const res = await api.get<ApiResponse<ProductListData>>("/products", { params });
  return res.data.data;
}

// GET /api/products/:slug
export async function getProductBySlugApi(slug: string) {
  const res = await api.get<ApiResponse<{ product: Product }>>(`/products/${slug}`);
  return res.data.data.product;
}

// ---- Admin (requires admin token) ----

// GET /api/products/admin
export async function getProductsAdminApi(params?: ProductListParams) {
  const res = await api.get<ApiResponse<ProductListData>>("/products/admin", { params });
  return res.data.data;
}

// GET /api/products/admin/:id
export async function getProductByIdAdminApi(id: string) {
  const res = await api.get<ApiResponse<{ product: Product }>>(`/products/admin/${id}`);
  return res.data.data.product;
}

// POST /api/products
export async function createProductApi(input: Partial<Product>) {
  const res = await api.post<ApiResponse<{ product: Product }>>("/products", input);
  return res.data.data.product;
}

// PATCH /api/products/:id
export async function updateProductApi(id: string, input: Partial<Product>) {
  const res = await api.patch<ApiResponse<{ product: Product }>>(`/products/${id}`, input);
  return res.data.data.product;
}
