import { notFound } from 'next/navigation';
import ProductPageClient from './ProductPageClient';
import { isPublicProduct } from '@/lib/catalog';
import { fetchProduct, fetchProducts } from '@/lib/server/catalog';

type Params = { slug: string };

// Prerender every public product at build time and refresh every 5 minutes.
// New products added in the CMS later are rendered on first request.
export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const products = (await fetchProducts()) || [];
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const product = await fetchProduct(slug);

  // Unknown, inactive and internal test products return a real 404 instead of an empty 200 page.
  if (!isPublicProduct(product)) notFound();

  return <ProductPageClient apiProduct={product!} />;
}
