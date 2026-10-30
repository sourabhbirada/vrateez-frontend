import api from "./axios";
import type { ApiResponse } from "./types";

export interface CouponValidationData {
  couponCode: string;
  discountAmount: number;
  description: string;
}

export interface Coupon {
  _id: string;
  code: string;
  description?: string;
  discountType: "percentage" | "fixed" | "free_shipping" | string;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount?: number;
  startsAt?: string;
  expiresAt?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// POST /api/coupons/validate (public)
export async function validateCouponApi(input: {
  couponCode: string;
  subtotal: number;
  shippingCharge?: number;
}) {
  const res = await api.post<ApiResponse<CouponValidationData>>("/coupons/validate", input);
  return res.data.data;
}

// ---- Admin ----

// GET /api/admin/coupons
export async function listCouponsAdminApi() {
  const res = await api.get<ApiResponse<{ items?: Coupon[]; coupons?: Coupon[] }>>("/admin/coupons");
  return res.data.data.items ?? res.data.data.coupons ?? [];
}

// POST /api/admin/coupons
export async function createCouponApi(input: Partial<Coupon>) {
  const res = await api.post<ApiResponse<{ coupon: Coupon }>>("/admin/coupons", input);
  return res.data.data.coupon;
}

// PATCH /api/admin/coupons/:id
export async function updateCouponApi(id: string, input: Partial<Coupon>) {
  const res = await api.patch<ApiResponse<{ coupon: Coupon }>>(`/admin/coupons/${id}`, input);
  return res.data.data.coupon;
}

// DELETE /api/admin/coupons/:id
export async function deleteCouponApi(id: string) {
  const res = await api.delete<ApiResponse<unknown>>(`/admin/coupons/${id}`);
  return res.data;
}
