'use client';

import HeroSection from '@/component/home/HeroSection';
import UspStrip from '@/component/home/UspStrip';
import WhyVrateezSection from '@/component/home/WhyVrateezSection';
import DealOfferSection from '@/component/home/DealOfferSection';
import BestsellersSection from '@/component/home/BestsellersSection';
import ReelsSection from '@/component/home/ReelsSection';
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
  const { settings } = useSettings();
  const sections = settings?.appearance?.homepageSections;

  return (
    <main>
      <h1 className="sr-only">Vrateez: vrat-friendly millet protein cookies, energy bars and fasting snacks</h1>
      {(sections?.heroCarousel ?? true) && <HeroSection />}
      <WhyVrateezSection />
      {/* Below-the-fold sections skip layout and paint until they near the viewport.
          Their content stays in the HTML for search engines and screen readers. */}
      <div className="defer-render">
        <UspStrip />
      </div>
      <div className="defer-render">
        <DealOfferSection />
      </div>
      <div className="defer-render">
        <BestsellersSection />
      </div>
      <div className="defer-render">
        <ReelsSection />
      </div>
      <div className="defer-render">
        <BundlesSection />
      </div>
      {(sections?.benefitsSection ?? true) && (
        <div className="defer-render">
          <BenefitsSection />
        </div>
      )}
      <div className="defer-render">
        <CompareSection />
      </div>
      {(sections?.ourProducts ?? true) && (
        <div className="defer-render">
          <OurProductsSection />
        </div>
      )}
      <div className="defer-render">
        <ProductsSection />
      </div>
      {(sections?.testimonials ?? true) && (
        <div className="defer-render">
          <TestimonialsSection />
        </div>
      )}
      <div className="defer-render">
        <FaqSection />
      </div>
      {(sections?.availableAtPartners ?? true) && (
        <div className="defer-render">
          <AvailableAtSection />
        </div>
      )}
      <div className="defer-render">
        <FinalCtaSection />
      </div>
      <WelcomeOffer />
    </main>
  );
}
