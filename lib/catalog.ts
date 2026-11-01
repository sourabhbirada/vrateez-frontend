import type { Category, Product } from '@/lib/api/types';

/** Categories used for internal testing in the CMS. They are never shown, listed or indexed. */
export const HIDDEN_CATEGORIES = new Set(['testing', 'test']);

export function isPublicProduct(p: Pick<Product, 'isActive' | 'category' | 'slug'> | null | undefined): boolean {
  return Boolean(p && p.slug && p.isActive !== false && !HIDDEN_CATEGORIES.has(String(p.category || '').toLowerCase()));
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
