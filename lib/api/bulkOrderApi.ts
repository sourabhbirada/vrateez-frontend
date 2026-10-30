import api from "./axios";
import type { ApiResponse } from "./types";

export interface BulkOrderInput {
  companyName?: string;
  yourName: string;
  phone: string;
  email: string;
  location?: string;
  inquiryType: string;
  message?: string;
}

export interface BulkOrder extends BulkOrderInput {
  _id: string;
  status: "new" | "contacted" | "quoted" | "converted" | "closed" | string;
  createdAt: string;
  updatedAt: string;
}

// POST /api/bulk-order (public)
export async function createBulkOrderApi(input: BulkOrderInput) {
  const res = await api.post<ApiResponse<{ bulkOrder?: BulkOrder; inquiry?: BulkOrder }>>("/bulk-order", input);
  return res.data;
}

// ---- Admin ----

// GET /api/bulk-order/admin
export async function listBulkOrdersAdminApi(params?: { status?: string; page?: number; limit?: number }) {
  const res = await api.get<ApiResponse<{ items?: BulkOrder[]; bulkOrders?: BulkOrder[]; pagination?: unknown }>>(
    "/bulk-order/admin",
    { params },
  );
  return res.data.data;
}

// PATCH /api/bulk-order/:id/status
export async function updateBulkOrderStatusApi(id: string, status: string) {
  const res = await api.patch<ApiResponse<{ bulkOrder: BulkOrder }>>(`/bulk-order/${id}/status`, { status });
  return res.data.data.bulkOrder;
}
