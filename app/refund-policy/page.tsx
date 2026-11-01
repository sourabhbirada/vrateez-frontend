import type { Metadata } from 'next';
import Link from 'next/link';
import PolicyPage from '@/component/legal/PolicyPage';
import { POLICY_UPDATED, getStoreFacts } from '@/lib/server/storeFacts';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Returns and Refunds: Damaged, Wrong or Missing Items',
  description: 'Vrateez replaces or refunds damaged, wrong or missing items reported within 48 hours of delivery. How cancellations and refunds work, including COD.',
  alternates: { canonical: `${SITE_URL}/refund-policy` },
};

export default async function RefundPolicyPage() {
  const f = await getStoreFacts();
  return (
    <PolicyPage
      eyebrow="Policies"
      title="Returns and refunds"
      updated={POLICY_UPDATED}
      intro={
        <p>
          Our snacks are food, so we cannot take packs back for a change of mind. If something arrives damaged, wrong or missing, we put it right.
        </p>
      }
      sections={[
        {
          heading: 'Damaged, wrong or missing items',
          body: (
            <>
              <p>Tell us within 48 hours of delivery and we will send a replacement or refund the item, whichever you prefer.</p>
              <ul>
                <li>Send your order ID, a photo of the outer parcel and a photo of the product.</li>
                <li>For a missing item, a photo of the opened box with its contents helps us check quickly.</li>
                <li>You do not need to ship damaged food back to us.</li>
              </ul>
            </>
          ),
        },
        {
          heading: 'Quality concerns',
          body: (
            <p>
              If a product tastes off or looks wrong before its best-before date, message us with the batch details printed on the pack. We look into every report
              and replace or refund the pack.
            </p>
          ),
        },
        {
          heading: 'Cancelling an order',
          body: (
            <ul>
              <li>You can cancel free of charge until the order is dispatched. Message us with your order ID.</li>
              <li>Once dispatched, an order cannot be cancelled. If you refuse a cash-on-delivery parcel, future orders may need to be prepaid.</li>
            </ul>
          ),
        },
        {
          heading: 'How refunds are paid',
          body: (
            <ul>
              <li>Prepaid orders are refunded to the original payment method within 5 to 7 business days of approval.</li>
              <li>Cash-on-delivery orders are refunded by UPI or bank transfer to details you share with us.</li>
            </ul>
          ),
        },
        {
          heading: 'Bulk and custom orders',
          body: <p>Custom hampers and branded orders follow the terms in your quotation. Damaged or missing items are still covered as above.</p>,
        },
        {
          heading: 'Contact',
          body: (
            <p>
              WhatsApp <a href={`https://wa.me/${f.whatsappDigits}`}>{f.whatsappDisplay}</a> or email <a href={`mailto:${f.email}`}>{f.email}</a>. See also the{' '}
              <Link href="/shipping-policy">shipping policy</Link>.
            </p>
          ),
        },
      ]}
    />
  );
}
