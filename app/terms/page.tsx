import type { Metadata } from 'next';
import Link from 'next/link';
import PolicyPage from '@/component/legal/PolicyPage';
import { LEGAL_NAME, POLICY_UPDATED, getStoreFacts } from '@/lib/server/storeFacts';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms for buying from Vrateez: orders, prices, payment, delivery, ingredients and allergens, and liability.',
  alternates: { canonical: `${SITE_URL}/terms` },
};

export default async function TermsPage() {
  const f = await getStoreFacts();
  return (
    <PolicyPage
      eyebrow="Policies"
      title="Terms of service"
      updated={POLICY_UPDATED}
      intro={<p>These terms apply when you browse or buy from vrateez.in, which is operated by {LEGAL_NAME}, {f.address}.</p>}
      sections={[
        {
          heading: 'Orders',
          body: (
            <p>
              An order is confirmed when you receive our order confirmation. We may cancel an order if a product is out of stock, a price was listed in error or the
              delivery address is not serviceable. Any payment for a cancelled order is refunded in full.
            </p>
          ),
        },
        {
          heading: 'Prices and payment',
          body: (
            <p>
              Prices are in Indian rupees and include applicable taxes. Shipping is shown at checkout. You can pay by UPI, card or net banking through Razorpay, or by
              cash on delivery where available.
            </p>
          ),
        },
        {
          heading: 'Delivery',
          body: (
            <p>
              Delivery times and charges are set out in our <Link href="/shipping-policy">shipping policy</Link>. Risk in the goods passes to you on delivery.
            </p>
          ),
        },
        {
          heading: 'Returns and refunds',
          body: (
            <p>
              See our <Link href="/refund-policy">returns and refunds policy</Link> for damaged, wrong or missing items and for cancellations.
            </p>
          ),
        },
        {
          heading: 'Ingredients, allergens and fasting',
          body: (
            <p>
              Each product page lists its ingredients. Our kitchen handles nuts, seeds and millets, so traces may be present in any product. Fasting rules vary by
              family and tradition, so please check the ingredients against your own practice. Our products are food, not medicine, and are not meant to diagnose,
              treat or prevent any condition.
            </p>
          ),
        },
        {
          heading: 'Content and trademarks',
          body: <p>The Vrateez name, logo, photos and text on this site belong to {LEGAL_NAME} and may not be reused without permission.</p>,
        },
        {
          heading: 'Liability',
          body: (
            <p>
              To the extent the law allows, our liability for any order is limited to the amount you paid for it. Nothing in these terms limits your rights under the
              Consumer Protection Act, 2019.
            </p>
          ),
        },
        {
          heading: 'Governing law',
          body: <p>These terms are governed by the laws of India. Courts in Jaipur, Rajasthan have jurisdiction.</p>,
        },
        {
          heading: 'Contact',
          body: (
            <p>
              Email <a href={`mailto:${f.email}`}>{f.email}</a> or call {f.phone}.
            </p>
          ),
        },
      ]}
    />
  );
}
