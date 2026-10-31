import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { API_BASE_URL } from '@/lib/api/config';
import { getProductCategoryLabel } from '@/lib/api/types';
import type { Product } from '@/lib/api/types';
import { resolveImage } from '@/lib/images';
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL, absoluteUrl, truncate } from '@/lib/site';

type Params = { slug: string };

async function fetchProduct(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(slug)}`, { next: { revalidate: 600 } });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: { product?: Product } };
    return json.data?.product || null;
  } catch {
    return null;
  }
}

function productImages(product: Product) {
  const list = product.images?.length ? product.images : [product.image];
  return list.filter(Boolean).map((img) => absoluteUrl(resolveImage(img)));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  if (!product) {
    return { title: 'Product not found', robots: { index: false, follow: true } };
  }

  const category = getProductCategoryLabel(product.category);
  const title = `${product.name} | ${category} · Vrat Friendly, Zero Added Sugar`;
  const description = truncate(
    product.description ||
      `Buy ${product.name} from Vrateez. ${category} made with millets, nuts and seeds. Vrat friendly, zero added sugar, FSSAI certified. Free delivery above ₹499.`,
  );
  const images = productImages(product);
  const url = `${SITE_URL}/product/${product.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      siteName: SITE_NAME,
      title: `${product.name} | ${SITE_NAME}`,
      description,
      images: (images.length ? images : [DEFAULT_OG_IMAGE]).slice(0, 3).map((img) => ({ url: img, alt: product.name })),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | ${SITE_NAME}`,
      description,
      images: images.length ? [images[0]] : [DEFAULT_OG_IMAGE],
    },
    robots: product.isActive === false ? { index: false, follow: true } : undefined,
  };
}

export default async function ProductLayout({ children, params }: { children: ReactNode; params: Promise<Params> }) {
  const { slug } = await params;
  const product = await fetchProduct(slug);

  const schema = product
    ? [
        {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          image: productImages(product),
          description: truncate(product.description, 500),
          sku: product.slug,
          brand: { '@type': 'Brand', name: SITE_NAME },
          category: getProductCategoryLabel(product.category),
          ...(product.reviews > 0
            ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: product.rating, reviewCount: product.reviews } }
            : {}),
          offers: {
            '@type': 'Offer',
            url: `${SITE_URL}/product/${product.slug}`,
            priceCurrency: 'INR',
            price: product.price,
            priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
            availability: product.stock === 0 ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
            itemCondition: 'https://schema.org/NewCondition',
            seller: { '@type': 'Organization', name: SITE_NAME },
            shippingDetails: {
              '@type': 'OfferShippingDetails',
              shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'IN' },
              deliveryTime: {
                '@type': 'ShippingDeliveryTime',
                handlingTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 2, unitCode: 'DAY' },
                transitTime: { '@type': 'QuantitativeValue', minValue: 3, maxValue: 7, unitCode: 'DAY' },
              },
            },
          },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
            { '@type': 'ListItem', position: 2, name: 'Shop', item: `${SITE_URL}/shop` },
            {
              '@type': 'ListItem',
              position: 3,
              name: getProductCategoryLabel(product.category),
              item: `${SITE_URL}/shop?category=${encodeURIComponent(product.category)}`,
            },
            { '@type': 'ListItem', position: 4, name: product.name, item: `${SITE_URL}/product/${product.slug}` },
          ],
        },
      ]
    : null;

  return (
    <>
      {schema ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ) : null}
      {children}
    </>
  );
}
