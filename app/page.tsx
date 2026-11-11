import type { Metadata } from 'next';
import HomePageClient from './HomePageClient';
import { upcomingOccasions } from '@/lib/occasions';
import { DEFAULT_FAQS, faqPageSchema } from '@/lib/seoFaqs';
import { DEFAULT_OG_IMAGE, SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: { absolute: "Vrateez | Vrat Snacks, Millet Protein Cookies & Energy Bars" },
  description: "Vrat-friendly millet protein cookies, energy bars and makhana. Zero added sugar, no palm oil, FSSAI certified. Free delivery above ₹499, COD available.",
  alternates: { canonical: SITE_URL },
  keywords: [
    "buy vrat food online",
    "vrat snacks",
    "vrat cookies",
    "fasting food India",
    "navratri snacks",
    "healthy vrat food",
    "protein cookies online",
    "vrat ka khana",
    "upvas food",
    "ekadashi food",
    "healthy cookies India",
    "millet snacks",
    "sugar free vrat snacks",
    "high protein vrat food",
    "vrat food delivery",
    "eat in vrat",
    "vrat-friendly snacks"
  ],
  openGraph: {
    title: "Vrateez | Vrat Food, Healthy Protein Cookies & Fasting Snacks",
    description: "Premium vrat-friendly protein cookies, energy bars & fasting snacks. Perfect for Navratri & all vrat occasions. Natural ingredients, zero added sugar, high protein. Free shipping above ₹499.",
    url: SITE_URL,
    type: "website",
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: "Vrateez vrat-friendly snacks" }],
  },
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema(DEFAULT_FAQS)) }} />
      <HomePageClient occasions={upcomingOccasions()} />
    </>
  );
}
