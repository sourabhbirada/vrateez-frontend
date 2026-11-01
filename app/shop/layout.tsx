import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Shop Vrat Snacks: Cookies, Energy Bars, Makhana',
  description:
    'Shop vrat-friendly millet protein cookies, energy bars, makhana and sama upma. Zero added sugar, no palm oil. Free delivery above ₹499, COD available.',
  alternates: { canonical: `${SITE_URL}/shop` },
  openGraph: {
    title: 'Shop Vrat Snacks: Cookies, Energy Bars, Makhana',
    description: 'Shop vrat-friendly millet protein cookies, energy bars, makhana and sama upma. Zero added sugar, no palm oil. Free delivery above ₹499, COD available.',
    url: `${SITE_URL}/shop`,
    images: [{ url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shop Vrat Snacks: Cookies, Energy Bars, Makhana',
    description: 'Shop vrat-friendly millet protein cookies, energy bars, makhana and sama upma. Zero added sugar, no palm oil. Free delivery above ₹499, COD available.',
    images: [`${SITE_URL}/og-image.jpg`],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
