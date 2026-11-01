import type { Metadata } from "next";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import Header from '../component/layout/Header';
import AnnouncementBar from '../component/layout/AnnouncementBar';
import Footer from '../component/layout/Footer';
import CartSidebar from '../component/cart/CartSidebar';
import AuthModal from '../component/auth/AuthModal';
import WhatsAppButton from '../component/ui/WhatsAppButton';
import CookieConsent from '../component/common/CookieConsent';
import ActivityTracker from '../component/common/ActivityTracker';
import Analytics from '../component/common/Analytics';
import ScrollReveal from '../component/common/ScrollReveal';
import { CartProvider } from '../context/CartContext';
import { AuthProvider } from '../context/AuthContext';
import { SettingsProvider } from '../context/SettingsContext';
import { CatalogProvider } from '../context/CatalogContext';
import { getStorefrontData } from '@/lib/server/catalog';
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["500"],
  display: "swap",
});

/**
 * FONT SETUP (add once in app/layout.tsx, outside this file):
 *
 * import { Fraunces, Inter, IBM_Plex_Mono } from 'next/font/google';
 *
 * const fraunces = Fraunces({
 *   subsets: ['latin'],
 *   variable: '--font-fraunces',
 *   weight: ['400', '500', '600'],
 *   style: ['normal', 'italic'],
 * });
 * const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
 * const plexMono = IBM_Plex_Mono({
 *   subsets: ['latin'],
 *   variable: '--font-mono',
 *   weight: ['500'],
 * });
 *
 * // on <body>:
 * className={`${fraunces.variable} ${inter.variable} ${plexMono.variable} font-sans`}
 *
 * Tailwind config additions:
 * fontFamily: {
 *   display: ['var(--font-fraunces)', 'serif'],
 *   sans: ['var(--font-inter)', 'sans-serif'],
 *   label: ['var(--font-mono)', 'monospace'],
 * },
 * colors: {
 *   parchment: '#F3EAD8',
 *   ink: '#241F16',
 *   turmeric: '#C4711F',
 *   basil: '#26362A',
 *   millet: '#E4A93D',
 *   clay: '#9C4221',
 * }
 */

const SITE_NAME = "Vrateez";
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.vrateez.in").replace(/\/$/, "");
const SITE_DESCRIPTION = "Buy vrat-friendly healthy protein cookies, energy bars & fasting snacks online in India. Perfect for vrat/upvas - made with millet, nuts & seeds. Zero added sugar, high protein, FSSAI certified. Free delivery on orders above ₹499.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Vrateez | Buy Vrat Food, Healthy Protein Cookies & Fasting Snacks Online",
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  icons: {
    icon: [
      { url: '/logo.png', sizes: 'any' },
      { url: '/logo.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/logo.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/logo.png',
  },
  keywords: [
    // Vrat/Fasting specific
    "vrat food",
    "vrat snacks",
    "vrat cookies",
    "fasting food",
    "fasting snacks",
    "upvas food",
    "upvas snacks",
    "navratri food",
    "navratri snacks",
    "vrat ka khana",
    "vrat food online",
    "healthy vrat snacks",
    "vrat me khane wala",
    "ekadashi food",
    "karwa chauth food",
    // Health & Nutrition
    "protein cookies",
    "healthy snacks",
    "energy bars",
    "healthy cookies",
    "millet cookies",
    "sugar free snacks",
    "high protein snacks",
    "healthy cookies online",
    "wholesome snacks",
    "nutritious snacks",
    "guilt free snacks",
    // Product types
    "almond cookies",
    "cashew cookies",
    "blueberry cookies",
    "protein bars",
    "energy cookies",
    "healthy protein bars",
    // Location & Buying
    "buy protein cookies India",
    "buy vrat food online",
    "order vrat snacks",
    "vrat food delivery",
    "FSSAI certified snacks",
    // Occasions
    "vrat food items",
    "eat in vrat",
    "what to eat during vrat",
    "vrat-friendly food",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Vrateez | Vrat Food, Healthy Protein Cookies & Fasting Snacks",
    description: SITE_DESCRIPTION,
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Vrateez - Vrat Food & Healthy Protein Snacks",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vrateez | Vrat Food, Healthy Protein Cookies & Fasting Snacks",
    description: SITE_DESCRIPTION,
    images: [`${SITE_URL}/og-image.jpg`],
    creator: "@vrateez",
  },
  // Only preview limits here. index/follow are the default, and setting them globally put a
  // second, conflicting robots tag on the 404 page next to Next.js's own "noindex".
  robots: {
    googleBot: {
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
};

const DEFAULT_CONTACT = {
  phone: "+91-70700 88100",
  whatsapp: "+916375010189",
  email: "support@vrateez.com",
};

const SOCIAL_PROFILES = [
  "https://instagram.com/vrateez",
  "https://facebook.com/vrateez",
  "https://twitter.com/vrateez",
  "https://youtube.com/@vrateez",
];

function JsonLd({ data }: { data: unknown }) {
  // Plain script tag (not next/script) so the schema is in the server HTML that crawlers read.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const storefront = await getStorefrontData();
  const contact = storefront.settings?.contact;
  const phone = contact?.phone || DEFAULT_CONTACT.phone;
  const email = contact?.supportEmail || DEFAULT_CONTACT.email;
  const social = storefront.settings?.socialMedia;
  const sameAs = [social?.instagram, social?.facebook, social?.twitter, social?.youtube].filter(Boolean) as string[];

  const address = {
    "@type": "PostalAddress",
    addressLocality: "Jaipur",
    addressRegion: "Rajasthan",
    addressCountry: "IN",
  };

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    legalName: "Vrateez Foods Pvt. Ltd.",
    alternateName: "Vrateez - Vrat Food & Healthy Snacks",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: SITE_DESCRIPTION,
    email,
    telephone: phone,
    address,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: phone,
      email,
      contactType: "customer service",
      areaServed: "IN",
      availableLanguage: ["en", "hi"],
    },
    sameAs: sameAs.length ? sameAs : SOCIAL_PROFILES,
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en-IN",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/shop?search={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };

  const store = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    "@id": `${SITE_URL}/#store`,
    name: SITE_NAME,
    url: SITE_URL,
    image: `${SITE_URL}/og-image.jpg`,
    logo: `${SITE_URL}/logo.png`,
    description: "Online store for vrat-friendly protein cookies, energy bars, makhana and fasting snacks, shipped across India from Jaipur.",
    address,
    telephone: phone,
    email,
    priceRange: "₹₹",
    currenciesAccepted: "INR",
    paymentAccepted: "Cash on delivery, UPI, Credit Card, Debit Card, Net banking",
    parentOrganization: { "@id": `${SITE_URL}/#organization` },
  };

  return (
    <html lang="en-IN">
      <head>
        <JsonLd data={organization} />
        <JsonLd data={website} />
        <JsonLd data={store} />
      </head>
      <body
        className={`${fraunces.variable} ${inter.variable} ${plexMono.variable} font-sans antialiased`}
      >
        <AuthProvider>
          <SettingsProvider initialSettings={storefront.settings}>
            <CatalogProvider
              initial={{
                products: storefront.products,
                categories: storefront.categories,
                banners: storefront.banners,
                homeDeals: storefront.homeDeals,
                landingDeals: storefront.landingDeals,
              }}
            >
              <CartProvider>
                <ActivityTracker />
                <Analytics />
                <ScrollReveal />
                <AnnouncementBar />
                <Header />
                {children}
                <Footer />
                <CartSidebar />
                <AuthModal />
                <WhatsAppButton />
                <CookieConsent />
              </CartProvider>
            </CatalogProvider>
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
