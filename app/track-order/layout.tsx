import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Track Your Order: Live Courier Updates',
  description:
    'Track your Vrateez order with your order ID or courier tracking number and see live shipment updates.',
  alternates: { canonical: `${SITE_URL}/track-order` },
  openGraph: {
    title: 'Track Your Order: Live Courier Updates',
    description: 'Track your Vrateez order with your order ID or courier tracking number and see live shipment updates.',
    url: `${SITE_URL}/track-order`,
    images: [{ url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Track Your Order: Live Courier Updates',
    description: 'Track your Vrateez order with your order ID or courier tracking number and see live shipment updates.',
    images: [`${SITE_URL}/og-image.jpg`],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
