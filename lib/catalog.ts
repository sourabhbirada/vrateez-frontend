import type { Category, Product, SiteSettings } from '@/lib/api/types';

/** Categories used for internal testing in the CMS. They are never shown, listed or indexed. */
export const HIDDEN_CATEGORIES = new Set(['testing', 'test']);

/**
 * Seasonal campaigns that are over. Products with these slugs are hidden everywhere, and CMS
 * banners or deals whose text or link matches RETIRED_CAMPAIGN are skipped. To bring Diwali
 * back next year, remove its entries here (and the /diwali redirect in next.config.ts).
 */
export const RETIRED_PRODUCT_SLUGS = new Set(['diwali-gift-hamper']);
export const RETIRED_CAMPAIGN = /diwali/i;

/** True for CMS banners and deals that belong to a retired campaign. */
export function isRetiredCampaign(...fields: Array<string | null | undefined>): boolean {
  return fields.some((f) => typeof f === 'string' && RETIRED_CAMPAIGN.test(f));
}

export function isPublicProduct(p: Pick<Product, 'isActive' | 'category' | 'slug'> | null | undefined): boolean {
  return Boolean(
    p &&
      p.slug &&
      p.isActive !== false &&
      !HIDDEN_CATEGORIES.has(String(p.category || '').toLowerCase()) &&
      !RETIRED_PRODUCT_SLUGS.has(p.slug),
  );
}

export function isPublicCategory(c: Pick<Category, 'slug'> | null | undefined): boolean {
  return Boolean(c && c.slug && !HIDDEN_CATEGORIES.has(c.slug.toLowerCase()));
}

export function publicProducts<T extends Pick<Product, 'isActive' | 'category' | 'slug'>>(items: T[] | null | undefined): T[] {
  return (items || []).filter(isPublicProduct);
}

export function publicCategories<T extends Pick<Category, 'slug'>>(items: T[] | null | undefined): T[] {
  return (items || []).filter(isPublicCategory);
}

/**
 * Fields the storefront's cards, bundles, deals and cart need from a product. The full product
 * (ingredients, nutrition, customisation) is only loaded on its own product page, so the shared
 * catalogue sent with every page stays small.
 */
const CARD_FIELDS = [
  '_id', 'name', 'slug', 'category', 'image', 'images', 'rating', 'reviews', 'price', 'originalPrice',
  'discount', 'weight', 'description', 'isActive', 'stock', 'packOptions', 'freeDelivery',
] as const;

export function cardProduct(p: Product): Product {
  const out: Record<string, unknown> = {};
  for (const key of CARD_FIELDS) {
    if (p[key] !== undefined) out[key] = p[key];
  }
  return out as unknown as Product;
}

/**
 * Settings the storefront reads in the browser. Admin-only switches (notifications) and the unused
 * SEO block are left on the server so they are not sent inside every page.
 */
export function publicSettings(s: SiteSettings | null): SiteSettings | null {
  if (!s) return null;
  const { appearance, shipping, contact, socialMedia, announcementBar, content } = s;
  return { appearance, shipping, contact, socialMedia, announcementBar, content } as SiteSettings;
}
