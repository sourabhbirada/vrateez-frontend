import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Diwali Gift Hamper ₹379: Healthy Festive Gifting',
  description:
    'Gift health this Diwali. Vrateez hamper with energy bars, millet cookies and bites, decorative diyas and a greeting card for ₹379 (save ₹120). Zero added sugar, vrat friendly, ships pan-India.',
  alternates: { canonical: `${SITE_URL}/diwali` },
  openGraph: {
    title: 'Diwali Gift Hamper ₹379: Healthy Festive Gifting',
    description: 'Gift health this Diwali. Vrateez hamper with energy bars, millet cookies and bites, decorative diyas and a greeting card for ₹379 (save ₹120). Zero added sugar, vrat friendly, ships pan-India.',
    url: `${SITE_URL}/diwali`,
    images: [{ url: `${SITE_URL}/og-diwali.jpg`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Diwali Gift Hamper ₹379: Healthy Festive Gifting',
    description: 'Gift health this Diwali. Vrateez hamper with energy bars, millet cookies and bites, decorative diyas and a greeting card for ₹379 (save ₹120). Zero added sugar, vrat friendly, ships pan-India.',
    images: [`${SITE_URL}/og-diwali.jpg`],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
