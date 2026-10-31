import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Bulk & Corporate Gifting: Healthy Hampers for Teams',
  description:
    'Custom Vrateez hampers for corporate gifting, festivals and events. Branded packaging, pan-India delivery and volume pricing. Get a quote within one working day.',
  alternates: { canonical: `${SITE_URL}/bulk-order` },
  openGraph: {
    title: 'Bulk & Corporate Gifting: Healthy Hampers for Teams',
    description: 'Custom Vrateez hampers for corporate gifting, festivals and events. Branded packaging, pan-India delivery and volume pricing. Get a quote within one working day.',
    url: `${SITE_URL}/bulk-order`,
    images: [{ url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bulk & Corporate Gifting: Healthy Hampers for Teams',
    description: 'Custom Vrateez hampers for corporate gifting, festivals and events. Branded packaging, pan-India delivery and volume pricing. Get a quote within one working day.',
    images: [`${SITE_URL}/og-image.jpg`],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
