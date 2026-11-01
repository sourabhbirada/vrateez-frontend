import ShopClient from './ShopClient';
import { fetchProducts } from '@/lib/server/catalog';
import { SITE_URL, absoluteUrl } from '@/lib/site';
import { resolveImage } from '@/lib/images';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] || '' : v || '';
}

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const category = first(sp.category);
  const query = first(sp.search) || first(sp.q);

  // ItemList lets search engines and AI assistants read the full range from the HTML.
  const products = (await fetchProducts()) || [];
  const itemList = products.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Vrateez snacks',
        url: `${SITE_URL}/shop`,
        numberOfItems: products.length,
        itemListElement: products.map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `${SITE_URL}/product/${p.slug}`,
          name: p.name,
          image: absoluteUrl(resolveImage(p.image)),
        })),
      }
    : null;

  return (
    <>
      {itemList ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} /> : null}
      <ShopClient initialCategory={category} initialQuery={query} />
    </>
  );
}
