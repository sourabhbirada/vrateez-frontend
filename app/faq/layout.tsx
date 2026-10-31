import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'FAQs: Vrat Food, Ingredients, Delivery & Payments',
  description:
    'Answers about Vrateez snacks: are they vrat friendly, how much sugar, delivery across India, cash on delivery, tracking and bulk gifting.',
  alternates: { canonical: `${SITE_URL}/faq` },
  openGraph: {
    title: 'FAQs: Vrat Food, Ingredients, Delivery & Payments',
    description: 'Answers about Vrateez snacks: are they vrat friendly, how much sugar, delivery across India, cash on delivery, tracking and bulk gifting.',
    url: `${SITE_URL}/faq`,
    images: [{ url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FAQs: Vrat Food, Ingredients, Delivery & Payments',
    description: 'Answers about Vrateez snacks: are they vrat friendly, how much sugar, delivery across India, cash on delivery, tracking and bulk gifting.',
    images: [`${SITE_URL}/og-image.jpg`],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
