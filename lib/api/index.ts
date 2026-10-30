/**
 * Vrateez frontend API: one import point for every backend route.
 * Backend: https://vrateez-backend-v1.onrender.com (see ./config.ts)
 *
 * Usage:
 *   import { getProductsApi, createOrderApi, API_BASE_URL } from "@/lib/api";
 */
export * from "./config";
export { default as api } from "./axios";
export * from "./types";
export * from "./storage";

export * from "./healthApi";
export * from "./authApi";
export * from "./productApi";
export * from "./categoryApi";
export * from "./cartApi";
export * from "./orderApi";
export * from "./paymentApi";
export * from "./couponApi";
export * from "./bannerApi";
export * from "./dealApi";
export * from "./faqApi";
export * from "./testimonialApi";
export * from "./settingsApi";
export * from "./bulkOrderApi";
export * from "./activityApi";
export * from "./dashboardApi";
export * from "./uploadApi";
