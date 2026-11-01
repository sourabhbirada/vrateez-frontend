import { API_BASE_URL } from '@/lib/api/config';
import type { Banner, Category, Deal, Faq, Product, SiteSettings } from '@/lib/api/types';
import { publicCategories, publicProducts } from '@/lib/catalog';

/**
 * Server-side reads of the public storefront API.
 *
 * Pages render this data into their HTML so search engines and AI crawlers see
 * products, prices and copy without running JavaScript. Results are cached and
 * refreshed every few minutes (ISR). If the backend is slow or down, each call
 * returns null and the client components fall back to fetching in the browser.
 */
const REVALIDATE_SECONDS = 300;
const TIMEOUT_MS = 12_000;

async function getJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: T };
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function fetchProducts(): Promise<Product[] | null> {
  const data = await getJson<{ items?: Product[] }>('/products?limit=200');
  return data?.items ? publicProducts(data.items) : null;
}

/**
 * One product by slug. Returns null only when the API says the product does not exist,
 * and throws when the backend is unreachable, so a slow backend never caches a 404 for a
 * real product (Next.js keeps serving the last good page instead).
 */
export async function fetchProduct(slug: string): Promise<Product | null> {
  const res = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(slug)}`, {
    next: { revalidate: REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (res.status === 404 || res.status === 400) return null;
  if (!res.ok) throw new Error(`Product API responded ${res.status} for ${slug}`);
  const json = (await res.json()) as { data?: { product?: Product } };
  return json.data?.product ?? null;
}

export async function fetchCategories(): Promise<Category[] | null> {
  const data = await getJson<{ items?: Category[] }>('/categories');
  return data?.items ? publicCategories(data.items) : null;
}

export async function fetchBanners(): Promise<Banner[] | null> {
  const data = await getJson<{ items?: Banner[] }>('/banners');
  return data?.items ?? null;
}

export async function fetchDeals(placement: 'homepage' | 'landing'): Promise<Deal[] | null> {
  const data = await getJson<{ items?: Deal[] }>(`/deals?placement=${placement}`);
  return data?.items ?? null;
}

export async function fetchFaqs(): Promise<Faq[] | null> {
  const data = await getJson<{ items?: Faq[] }>('/faqs');
  return data?.items ?? null;
}

export async function fetchSettings(): Promise<SiteSettings | null> {
  const data = await getJson<{ settings?: SiteSettings }>('/settings');
  return data?.settings ?? null;
}

export type StorefrontData = {
  settings: SiteSettings | null;
  products: Product[] | null;
  categories: Category[] | null;
  banners: Banner[] | null;
  homeDeals: Deal[] | null;
  landingDeals: Deal[] | null;
};

/** Everything the shared layout and storefront sections need, fetched in parallel. */
export async function getStorefrontData(): Promise<StorefrontData> {
  const [settings, products, categories, banners, homeDeals, landingDeals] = await Promise.all([
    fetchSettings(),
    fetchProducts(),
    fetchCategories(),
    fetchBanners(),
    fetchDeals('homepage'),
    fetchDeals('landing'),
  ]);
  return { settings, products, categories, banners, homeDeals, landingDeals };
}
