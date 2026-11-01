import type { Metadata } from 'next';
import PolicyPage from '@/component/legal/PolicyPage';
import { LEGAL_NAME, POLICY_UPDATED, getStoreFacts } from '@/lib/server/storeFacts';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'What personal data Vrateez collects, why, who it is shared with, how long it is kept and how to see, correct or delete it.',
  alternates: { canonical: `${SITE_URL}/privacy-policy` },
};

export default async function PrivacyPolicyPage() {
  const f = await getStoreFacts();
  return (
    <PolicyPage
      eyebrow="Policies"
      title="Privacy policy"
      updated={POLICY_UPDATED}
      intro={<p>{LEGAL_NAME} (&quot;Vrateez&quot;) runs vrateez.in. This page explains what we collect when you shop with us and how we use it.</p>}
      sections={[
        {
          heading: 'What we collect',
          body: (
            <ul>
              <li>Order details: name, phone number, email, delivery address and the products you buy.</li>
              <li>Account details if you create one: name, email and phone.</li>
              <li>Messages you send us by WhatsApp, email or the bulk-order form.</li>
              <li>Browsing data such as pages viewed and items added to the cart, collected only if you accept cookies.</li>
            </ul>
          ),
        },
        {
          heading: 'What we do not collect',
          body: <p>Card, UPI and bank details are entered on Razorpay&apos;s secure payment page. We never see or store them.</p>,
        },
        {
          heading: 'How we use it',
          body: (
            <ul>
              <li>To process, pack, deliver and support your order.</li>
              <li>To send order and tracking updates by WhatsApp, SMS and email.</li>
              <li>To send offers, only if you opt in. You can opt out at any time.</li>
              <li>To understand which products and pages work, so we can improve the shop.</li>
            </ul>
          ),
        },
        {
          heading: 'Who we share it with',
          body: (
            <ul>
              <li>Courier partners, to deliver your order.</li>
              <li>Razorpay, to take payment.</li>
              <li>Hosting, email, messaging and analytics providers that process data on our behalf. Google Analytics and Meta load only with your cookie consent.</li>
            </ul>
          ),
        },
        {
          heading: 'Cookies',
          body: (
            <p>
              Essential cookies keep your cart and login working. Analytics and advertising cookies load only after you choose Accept in the cookie banner. Choosing
              Reject keeps only the essentials.
            </p>
          ),
        },
        {
          heading: 'How long we keep it',
          body: (
            <p>
              Order records are kept as long as tax and accounting law requires. Marketing preferences are kept until you opt out. You can ask us to delete your
              account at any time.
            </p>
          ),
        },
        {
          heading: 'Your rights',
          body: (
            <p>
              Under India&apos;s Digital Personal Data Protection Act, 2023 you can ask to see, correct or erase your personal data, withdraw consent and raise a
              grievance. Email <a href={`mailto:${f.email}`}>{f.email}</a> and we will respond within 30 days.
            </p>
          ),
        },
        {
          heading: 'Contact',
          body: (
            <p>
              {LEGAL_NAME}, {f.address}. Email <a href={`mailto:${f.email}`}>{f.email}</a>, phone {f.phone}.
            </p>
          ),
        },
      ]}
    />
  );
}
