import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'About Vrateez: Clean-Label Vrat Snacks from Jaipur',
  description:
    'Vrateez bakes millet-based, zero-added-sugar snacks that are vrat friendly every day. Meet the team, the kitchen and the promise behind every box.',
  alternates: { canonical: `${SITE_URL}/about-us` },
  openGraph: {
    title: 'About Vrateez: Clean-Label Vrat Snacks from Jaipur',
    description: 'Vrateez bakes millet-based, zero-added-sugar snacks that are vrat friendly every day. Meet the team, the kitchen and the promise behind every box.',
    url: `${SITE_URL}/about-us`,
    images: [{ url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Vrateez: Clean-Label Vrat Snacks from Jaipur',
    description: 'Vrateez bakes millet-based, zero-added-sugar snacks that are vrat friendly every day. Meet the team, the kitchen and the promise behind every box.',
    images: [`${SITE_URL}/og-image.jpg`],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
