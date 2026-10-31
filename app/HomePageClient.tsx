'use client';

import HeroSection from '@/component/home/HeroSection';
import UspStrip from '@/component/home/UspStrip';
import WhyVrateezSection from '@/component/home/WhyVrateezSection';
import DealOfferSection from '@/component/home/DealOfferSection';
import BestsellersSection from '@/component/home/BestsellersSection';
import BundlesSection from '@/component/home/BundlesSection';
import BenefitsSection from '@/component/home/BenefitsSection';
import CompareSection from '@/component/home/CompareSection';
import OurProductsSection from '@/component/home/OurProductsSection';
import ProductsSection from '@/component/home/ProductsSection';
import TestimonialsSection from '@/component/home/TestimonialsSection';
import FaqSection from '@/component/home/FaqSection';
import AvailableAtSection from '@/component/home/AvailableAtSection';
import FinalCtaSection from '@/component/home/FinalCtaSection';
import WelcomeOffer from '@/component/common/WelcomeOffer';
import { useSettings } from '@/context/SettingsContext';

/**
 * Home page, ordered as a sales funnel:
 * hook (hero) → trust (USP strip) → offer (deal) → easy first purchase (bestsellers, boxes)
 * → why us (benefits, comparison) → full range → proof (reviews) → objections (FAQ) → close.
 */
export default function HomePage() {
  const { settings, loading } = useSettings();
  const sections = settings?.appearance?.homepageSections;

  if (loading) {
    return <main className="min-h-[50vh] bg-parchment" />;
  }

  return (
    <main>
      {(sections?.heroCarousel ?? true) && <HeroSection />}
      <WhyVrateezSection />
      <UspStrip />
      <DealOfferSection />
      <BestsellersSection />
      <BundlesSection />
      {(sections?.benefitsSection ?? true) && <BenefitsSection />}
      <CompareSection />
      {(sections?.ourProducts ?? true) && <OurProductsSection />}
      <ProductsSection />
      {(sections?.testimonials ?? true) && <TestimonialsSection />}
      <FaqSection />
      {(sections?.availableAtPartners ?? true) && <AvailableAtSection />}
      <FinalCtaSection />
      <WelcomeOffer />
    </main>
  );
}
