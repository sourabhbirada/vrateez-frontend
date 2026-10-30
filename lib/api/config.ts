/**
 * Central backend configuration for the frontend.
 *
 * Production backend (Render): https://vrateez-backend-v1.onrender.com
 *
 * Override with env vars when needed:
 *   NEXT_PUBLIC_API_URL        -> backend origin (no trailing slash, no /api)
 *   NEXT_PUBLIC_API_BASE_URL   -> full API base (origin + /api)
 */

export const DEFAULT_BACKEND_URL = "https://vrateez-backend-v1.onrender.com";

function stripTrailingSlash(url: string) {
  return url.replace(/\/+$/, "");
}

/** Backend origin, e.g. https://vrateez-backend-v1.onrender.com */
export const BACKEND_URL = stripTrailingSlash(
  process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NEXT_PUBLIC_API_BASE_URL
      ? process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/api\/?$/, "")
      : DEFAULT_BACKEND_URL)
);

/** Full API base, e.g. https://vrateez-backend-v1.onrender.com/api */
export const API_BASE_URL = stripTrailingSlash(
  process.env.NEXT_PUBLIC_API_BASE_URL || `${BACKEND_URL}/api`
);

/** Build an absolute API URL from a path like "/orders/track/123". */
export function apiUrl(path: string) {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${clean}`;
}
