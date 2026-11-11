import { getProductCategoryLabel } from '@/lib/api/types';
import { getAllPosts } from '@/lib/blog';
import { DEFAULT_FAQS } from '@/lib/seoFaqs';
import { fetchProducts, fetchSettings } from '@/lib/server/catalog';
import { upcomingOccasions } from '@/lib/occasions';
import { SITE_URL } from '@/lib/site';

export const revalidate = 3600;

/**
 * /llms.txt: a plain-text guide to the site for AI assistants (https://llmstxt.org).
 * Built from live product and settings data so prices and contact details stay current.
 */
export async function GET() {
  const [products, settings] = await Promise.all([fetchProducts(), fetchSettings()]);
  const contact = settings?.contact;
  const threshold = settings?.shipping?.freeShippingThreshold ?? 499;
  const fee = settings?.shipping?.standardShippingFee ?? 49;
  const delivery = settings?.shipping?.deliveryDays || '3-5 business days';

  const byCategory = new Map<string, NonNullable<typeof products>>();
  for (const p of products || []) {
    const label = getProductCategoryLabel(p.category);
    byCategory.set(label, [...(byCategory.get(label) || []), p]);
  }

  const productLines = [...byCategory.entries()]
    .map(([label, items]) =>
      [
        `### ${label}`,
        ...items.map((p) => {
          const size = p.weight ? `, ${p.weight}` : '';
          const desc = p.description ? `: ${p.description.replace(/\s+/g, ' ').trim()}` : '';
          return `- [${p.name}](${SITE_URL}/product/${p.slug}) (₹${p.price}${size})${desc}`;
        }),
      ].join('\n'),
    )
    .join('\n\n');

  const posts = getAllPosts();
  const occasions = upcomingOccasions();

  const body = `# Vrateez

> Vrateez (Vrateez Foods Pvt. Ltd.) makes vrat-friendly, millet-based snacks in Jaipur, Rajasthan, India: protein cookies, energy bars, roasted makhana and instant fasting meals. Everything is made without onion, garlic, wheat, rice, maida, palm oil or added sugar, and is suitable for Navratri, Ekadashi and other Hindu fasts. Sold online across India at ${SITE_URL}.

Key facts:
- Ingredients: millets, nuts, seeds, dates and fruit. Zero added sugar. No palm oil, no maida, no onion or garlic.
- Made in an FSSAI-certified kitchen in Jaipur, packed fresh to order.
- Delivery: pan-India, ${delivery}. Free delivery on orders above ₹${threshold}; otherwise ₹${fee}.
- Payment: UPI, cards, net banking (Razorpay) and cash on delivery.
- Contact: ${contact?.supportEmail || 'support@vrateez.com'}, phone ${contact?.phone || '+91-70700 88100'}, WhatsApp ${contact?.whatsapp || '+91 63750 10189'}.

## Products

${productLines || `- [All products](${SITE_URL}/shop)`}

## Shop and help

- [Shop all products](${SITE_URL}/shop)
- [Bulk and corporate gifting](${SITE_URL}/bulk-order): custom hampers, branded packaging, volume pricing
- [Track an order](${SITE_URL}/track-order)
- [FAQ](${SITE_URL}/faq)
- [About Vrateez](${SITE_URL}/about-us): founders and philosophy
- [Contact](${SITE_URL}/contact)
- [Upcoming fasts and festivals](${SITE_URL}/occasions)

## Policies

- [Shipping policy](${SITE_URL}/shipping-policy)
- [Returns and refunds](${SITE_URL}/refund-policy)
- [Privacy policy](${SITE_URL}/privacy-policy)
- [Terms of service](${SITE_URL}/terms)
${
  posts.length
    ? `
## Guides

${posts.map((p) => `- [${p.title}](${SITE_URL}/blog/${p.slug}): ${p.description}`).join('\n')}
`
    : ''
}
${
  occasions.length
    ? `## Coming up (India dates, Drik Panchang)

${occasions.map((o) => `- ${o.name} (${o.dateLabel}): ${o.blurb}`).join('\n')}

`
    : ''
}## Common questions

${DEFAULT_FAQS.map((f) => `- ${f.question} ${f.answer}`).join('\n')}
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
