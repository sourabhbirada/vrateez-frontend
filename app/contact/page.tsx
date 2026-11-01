import type { Metadata } from 'next';
import Link from 'next/link';
import PolicyPage from '@/component/legal/PolicyPage';
import { LEGAL_NAME, getStoreFacts } from '@/lib/server/storeFacts';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contact Vrateez: WhatsApp, Phone and Email',
  description: 'Reach Vrateez in Jaipur by WhatsApp, phone or email for orders, delivery, vrat questions and bulk gifting. A real person replies within one working day.',
  alternates: { canonical: `${SITE_URL}/contact` },
};

export default async function ContactPage() {
  const f = await getStoreFacts();
  const card = 'rounded-[22px] bg-white p-6 ring-1 ring-ink/[0.08] transition hover:ring-turmeric/40';
  const label = 'font-label text-[10px] uppercase tracking-[0.2em] text-clay';
  const value = 'mt-2 block break-words font-display text-xl italic text-ink';
  return (
    <PolicyPage
      eyebrow="Support"
      title="Contact us"
      intro={<p>Questions about an order, ingredients or a vrat? Message us and a real person from our Jaipur kitchen replies, usually within one working day.</p>}
      aside={
        <div className="grid gap-4 sm:grid-cols-2">
          <a href={`https://wa.me/${f.whatsappDigits}`} target="_blank" rel="noopener noreferrer" className={card}>
            <span className={label}>WhatsApp</span>
            <span className={value}>{f.whatsappDisplay}</span>
          </a>
          <a href={`tel:${f.phone.replace(/\s+/g, '')}`} className={card}>
            <span className={label}>Phone</span>
            <span className={value}>{f.phone}</span>
          </a>
          <a href={`mailto:${f.email}`} className={card}>
            <span className={label}>Email</span>
            <span className={value}>{f.email}</span>
          </a>
          <div className="rounded-[22px] bg-white p-6 ring-1 ring-ink/[0.08]">
            <span className={label}>Address</span>
            <span className={value}>{f.address}</span>
          </div>
        </div>
      }
      sections={[
        {
          heading: 'Orders and delivery',
          body: (
            <p>
              Track a parcel on the <Link href="/track-order">Track order</Link> page, or read the <Link href="/shipping-policy">shipping</Link> and{' '}
              <Link href="/refund-policy">returns</Link> policies.
            </p>
          ),
        },
        {
          heading: 'Bulk and corporate gifting',
          body: (
            <p>
              For hampers, branded packaging and volume pricing, use the <Link href="/bulk-order">bulk order form</Link>.
            </p>
          ),
        },
        {
          heading: 'Company',
          body: (
            <p>
              {LEGAL_NAME}, {f.address}.
            </p>
          ),
        },
      ]}
    />
  );
}
