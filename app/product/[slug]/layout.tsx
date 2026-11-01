import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { getProductCategoryLabel } from '@/lib/api/types';
import type { Product } from '@/lib/api/types';
import { isPublicProduct } from '@/lib/catalog';
import { resolveImage } from '@/lib/images';
import { fetchProduct as fetchProductFromApi } from '@/lib/server/catalog';
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL, absoluteUrl, truncate } from '@/lib/site';

type Params = { slug: string };

/** Only active, non-test products are public. Everything else is a 404. */
async function fetchProduct(slug: string): Promise<Product | null> {
  const product = await fetchProductFromApi(slug);
  return isPublicProduct(product) ? product : null;
}

/** Product title kept under ~50 characters so " | Vrateez" still fits in a search snippet. */
function productTitle(product: Product) {
  const candidates = [
    `${product.name} | Vrat Friendly, No Added Sugar`,
    `${product.name} | Vrat Friendly Snack`,
    product.name,
  ];
  return candidates.find((t) => t.length <= 50) || product.name;
}

function productDescription(product: Product) {
  const base = (product.description || '').trim().replace(/[.\s]+$/, '');
  const size = product.weight ? ` ${product.weight}` : '';
  const price = product.price ? ` for ₹${product.price}` : '';
  return truncate(
    `${base ? `${base}.` : `${product.name} from Vrateez.`}${size}${price}. Vrat friendly, zero added sugar, FSSAI certified. Free delivery above ₹499, COD available.`,
    158,
  );
}

function productImages(product: Product) {
  const list = product.images?.length ? product.images : [product.image];
  return list.filter(Boolean).map((img) => absoluteUrl(resolveImage(img)));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  if (!product) {
    return { title: 'Product not found', robots: { index: false, follow: false } };
  }

  const title = productTitle(product);
  const description = productDescription(product);
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
  // Stop before rendering anything for unknown, inactive or test products, so the branded 404 page renders.
  if (!product) notFound();

  const schema = product
    ? [
        {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          image: productImages(product),
          description: truncate(product.description, 500),
          sku: product.slug,
          url: `${SITE_URL}/product/${product.slug}`,
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
            seller: { '@type': 'Organization', name: SITE_NAME, '@id': `${SITE_URL}/#organization` },
            // Food is not returnable for change of mind; damaged or wrong items are replaced (see /refund-policy).
            hasMerchantReturnPolicy: {
              '@type': 'MerchantReturnPolicy',
              applicableCountry: 'IN',
              returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
              merchantReturnLink: `${SITE_URL}/refund-policy`,
            },
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
