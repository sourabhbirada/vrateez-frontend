import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Shop Vrat Snacks: Protein Cookies, Energy Bars & Makhana',
  description:
    'Shop vrat-friendly snacks online: millet protein cookies, energy bars, roasted makhana and instant sama upma. Zero added sugar, no palm oil, FSSAI certified. Free delivery above ₹499, cash on delivery available.',
  alternates: { canonical: `${SITE_URL}/shop` },
  openGraph: {
    title: 'Shop Vrat Snacks: Protein Cookies, Energy Bars & Makhana',
    description: 'Shop vrat-friendly snacks online: millet protein cookies, energy bars, roasted makhana and instant sama upma. Zero added sugar, no palm oil, FSSAI certified. Free delivery above ₹499, cash on delivery available.',
    url: `${SITE_URL}/shop`,
    images: [{ url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shop Vrat Snacks: Protein Cookies, Energy Bars & Makhana',
    description: 'Shop vrat-friendly snacks online: millet protein cookies, energy bars, roasted makhana and instant sama upma. Zero added sugar, no palm oil, FSSAI certified. Free delivery above ₹499, cash on delivery available.',
    images: [`${SITE_URL}/og-image.jpg`],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
