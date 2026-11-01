import type { Metadata } from 'next';
import Link from 'next/link';
import PolicyPage from '@/component/legal/PolicyPage';
import { POLICY_UPDATED, getStoreFacts } from '@/lib/server/storeFacts';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Shipping Policy: Delivery Times and Charges',
  description: 'How Vrateez ships across India: orders packed in 24 to 48 hours, delivery in 3 to 5 business days, free delivery above ₹499 and cash on delivery.',
  alternates: { canonical: `${SITE_URL}/shipping-policy` },
};

export default async function ShippingPolicyPage() {
  const f = await getStoreFacts();
  return (
    <PolicyPage
      eyebrow="Policies"
      title="Shipping policy"
      updated={POLICY_UPDATED}
      intro={<p>We bake in small batches in Jaipur and pack every order fresh. Here is how and when it reaches you.</p>}
      sections={[
        {
          heading: 'Where we deliver',
          body: <p>We ship to serviceable pin codes across India through courier partners. If your pin code is not serviceable, checkout tells you before you pay.</p>,
        },
        {
          heading: 'Packing and delivery times',
          body: (
            <ul>
              <li>Orders are packed within 24 to 48 hours of being placed, excluding Sundays and public holidays.</li>
              <li>Delivery usually takes {f.deliveryDays} after dispatch. Remote areas and the north-east can take up to 7 business days.</li>
              <li>Festival weeks can add a day or two. We message you if your order is delayed.</li>
            </ul>
          ),
        },
        {
          heading: 'Shipping charges',
          body: (
            <ul>
              <li>Free delivery on orders above ₹{f.freeShippingThreshold}.</li>
              <li>Orders below ₹{f.freeShippingThreshold} pay a flat ₹{f.shippingFee} shipping fee, shown at checkout before payment.</li>
              <li>Some products carry free delivery on their own; the product page says so.</li>
            </ul>
          ),
        },
        {
          heading: 'Cash on delivery',
          body: (
            <p>
              {f.cod
                ? 'Cash on delivery is available on most pin codes. Please keep the exact amount ready.'
                : 'Cash on delivery is currently paused. You can pay by UPI, card or net banking.'}
            </p>
          ),
        },
        {
          heading: 'Tracking your order',
          body: (
            <p>
              As soon as the courier picks up your parcel we send the tracking number by WhatsApp and email. You can also follow it on the{' '}
              <Link href="/track-order">Track order</Link> page.
            </p>
          ),
        },
        {
          heading: 'Wrong address or failed delivery',
          body: (
            <p>
              Please check your address and phone number at checkout. If a parcel comes back because the address was wrong or nobody was available after the
              courier&apos;s attempts, we can reship it for the shipping fee. Prepaid orders that cannot be reshipped are refunded minus the shipping cost.
            </p>
          ),
        },
        {
          heading: 'Questions',
          body: (
            <p>
              Email <a href={`mailto:${f.email}`}>{f.email}</a> or WhatsApp <a href={`https://wa.me/${f.whatsappDigits}`}>{f.whatsappDisplay}</a>. See also our{' '}
              <Link href="/refund-policy">returns and refunds policy</Link>.
            </p>
          ),
        },
      ]}
    />
  );
}
