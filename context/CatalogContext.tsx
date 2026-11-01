'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getBannersApi } from '@/lib/api/bannerApi';
import { getCategoriesApi } from '@/lib/api/categoryApi';
import { getDealsApi } from '@/lib/api/dealApi';
import { getProductsApi } from '@/lib/api/productApi';
import type { Banner, Category, Deal, Product } from '@/lib/api/types';
import { publicCategories, publicProducts } from '@/lib/catalog';

export type CatalogData = {
  products: Product[] | null;
  categories: Category[] | null;
  banners: Banner[] | null;
  homeDeals: Deal[] | null;
  landingDeals: Deal[] | null;
};

type CatalogContextValue = CatalogData & { loaded: boolean };

const EMPTY: CatalogData = { products: null, categories: null, banners: null, homeDeals: null, landingDeals: null };

const CatalogContext = createContext<CatalogContextValue>({ ...EMPTY, loaded: false });

/**
 * Storefront catalogue, seeded on the server by the root layout so product,
 * category, banner and deal content is in the initial HTML. Anything the server
 * could not load (backend timeout) is fetched once in the browser instead.
 */
export function CatalogProvider({ initial, children }: { initial?: Partial<CatalogData>; children: ReactNode }) {
  const [data, setData] = useState<CatalogData>({ ...EMPTY, ...initial });

  useEffect(() => {
    let cancelled = false;
    const missing = (Object.keys(EMPTY) as Array<keyof CatalogData>).filter((k) => data[k] == null);
    if (!missing.length) return;

    const loaders: Record<keyof CatalogData, () => Promise<unknown>> = {
      products: () => getProductsApi({ limit: 200 }).then((r) => publicProducts(r.items)),
      categories: () => getCategoriesApi().then(publicCategories),
      banners: () => getBannersApi(),
      homeDeals: () => getDealsApi('homepage'),
      landingDeals: () => getDealsApi('landing'),
    };

    Promise.all(
      missing.map((k) =>
        loaders[k]()
          .then((v) => [k, v] as const)
          .catch(() => [k, []] as const),
      ),
    ).then((entries) => {
      if (cancelled) return;
      setData((prev) => {
        const next = { ...prev } as Record<string, unknown>;
        for (const [k, v] of entries) next[k] = v;
        return next as CatalogData;
      });
    });

    return () => {
      cancelled = true;
    };
    // Run once on mount; later updates come from navigation re-renders of the layout.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loaded = (Object.keys(EMPTY) as Array<keyof CatalogData>).every((k) => data[k] != null);

  return <CatalogContext.Provider value={{ ...data, loaded }}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  return useContext(CatalogContext);
}

/** Public products (test and inactive items removed). Empty array until loaded. */
export function useProducts() {
  const { products } = useContext(CatalogContext);
  return { products: products ?? [], loaded: products != null };
}

export function useCategories() {
  const { categories } = useContext(CatalogContext);
  return { categories: categories ?? [], loaded: categories != null };
}
