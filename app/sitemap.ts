import type { MetadataRoute } from 'next';
import { API_BASE_URL } from '@/lib/api/config';
import { getAllPosts } from '@/lib/blog';

type ProductLite = { slug: string; isActive?: boolean; category?: string; updatedAt?: string };

async function fetchProducts(): Promise<ProductLite[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/products?limit=200`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: { items?: ProductLite[] } };
    return json.data?.items || [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vrateez.in').replace(/\/$/, '');
  const now = new Date();

  const routes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/shop`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/diwali`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/track-order`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${baseUrl}/about-us`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/bulk-order`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
  ];

  const blogRoutes: MetadataRoute.Sitemap = getAllPosts().map((p) => ({
    url: `${baseUrl}/blog/${p.slug}`,
    lastModified: new Date(p.updated || p.date),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const categories = ['cookies', 'infused-cookie', 'energy-on-the-go', 'savory-snacks', 'wholesome-delights'];
  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/shop?category=${category}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  const products = await fetchProducts();
  const productRoutes: MetadataRoute.Sitemap = products
    .filter((p) => p.slug && p.isActive !== false && p.category !== 'testing')
    .map((p) => ({
      url: `${baseUrl}/product/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

  return [...routes, ...blogRoutes, ...categoryRoutes, ...productRoutes];
}
