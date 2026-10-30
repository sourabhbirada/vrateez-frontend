import api from "./axios";
import type { ApiResponse, Order, GuestInfo, ShippingAddress, LiveTracking } from "./types";

export type PaymentMethod = "card" | "upi" | "netbanking" | "cod" | "razorpay";

export interface OrderTrackingData {
  hasTracking: boolean;
  tracking?: LiveTracking;
  source?: string;
  orderId?: string;
  message?: string;
  fallback?: {
    trackingNumber: string;
    courierPartner?: string;
    trackingEvents?: any[];
  };
}

// ---- Authenticated users ----

// POST /api/orders
export async function createOrderApi(input: {
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  notes?: string;
  couponCode?: string;
  contactPhone?: string;
}) {
  const res = await api.post<ApiResponse<{ order: Order }>>("/orders", input);
  return res.data.data.order;
}

// GET /api/orders/me
export async function getMyOrdersApi() {
  const res = await api.get<ApiResponse<{ orders: Order[] }>>("/orders/me");
  return res.data.data.orders;
}

// GET /api/orders/:id
export async function getOrderByIdApi(orderId: string) {
  const res = await api.get<ApiResponse<{ order: Order }>>(`/orders/${orderId}`);
  return res.data.data.order;
}

// ---- Guest users ----

// POST /api/guest/orders
export async function createGuestOrderApi(input: {
  items: Array<{ productId: string; quantity: number }>;
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  guestInfo: GuestInfo;
  notes?: string;
  couponCode?: string;
}) {
  const res = await api.post<ApiResponse<{ order: Order }>>("/guest/orders", input);
  return res.data.data.order;
}

// GET /api/guest/orders/:id?email=
export async function getGuestOrderApi(orderId: string, email: string) {
  const res = await api.get<ApiResponse<{ order: Order }>>(`/guest/orders/${orderId}`, {
    params: { email },
  });
  return res.data.data.order;
}

// POST /api/guest/orders/confirm-cod
export async function confirmGuestCodOrderApi(orderId: string, email: string) {
  const res = await api.post<ApiResponse<{ order: Order }>>("/guest/orders/confirm-cod", { orderId, email });
  return res.data.data.order;
}

// ---- Tracking (public, optional auth) ----

// GET /api/orders/:id/tracking
export async function getOrderTrackingApi(orderId: string) {
  const res = await api.get<ApiResponse<OrderTrackingData>>(`/orders/${orderId}/tracking`);
  return res.data.data;
}

// GET /api/orders/track/:orderId?email=
export async function getOrderByOrderIdApi(orderId: string, email?: string) {
  const res = await api.get<ApiResponse<{ order: Order }>>(`/orders/track/${orderId}`, {
    params: email ? { email } : undefined,
  });
  return res.data.data.order;
}

// GET /api/orders/track-by-number/:trackingNumber?email=
export async function getOrderByTrackingNumberApi(trackingNumber: string, email?: string) {
  const res = await api.get<ApiResponse<{ order: Order }>>(`/orders/track-by-number/${trackingNumber}`, {
    params: email ? { email } : undefined,
  });
  return res.data.data.order;
}

// ---- Admin ----

// GET /api/orders/admin
export async function listOrdersAdminApi(params?: {
  status?: string;
  paymentStatus?: string;
  page?: number;
  limit?: number;
  q?: string;
}) {
  const res = await api.get<ApiResponse<{ orders?: Order[]; items?: Order[]; pagination?: unknown }>>(
    "/orders/admin",
    { params },
  );
  return res.data.data;
}

// GET /api/orders/admin/:id
export async function getOrderByIdAdminApi(id: string) {
  const res = await api.get<ApiResponse<{ order: Order }>>(`/orders/admin/${id}`);
  return res.data.data.order;
}

// PATCH /api/orders/:id/status
export async function updateOrderStatusApi(
  id: string,
  input: {
    orderStatus?: Order["orderStatus"];
    paymentStatus?: Order["paymentStatus"];
    trackingNumber?: string;
    courierPartner?: string;
    estimatedDeliveryAt?: string;
    note?: string;
    location?: string;
  },
) {
  const res = await api.patch<ApiResponse<{ order: Order }>>(`/orders/${id}/status`, input);
  return res.data.data.order;
}
