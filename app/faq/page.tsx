import FaqClient from './FaqClient';
import type { Faq } from '@/lib/api/types';
import { DEFAULT_FAQ_PAGE, faqPageSchema } from '@/lib/seoFaqs';
import { fetchFaqs } from '@/lib/server/catalog';

/** CMS FAQs when there are any, otherwise the built-in set, so the page is never empty. */
async function loadFaqs(): Promise<Faq[]> {
  const cms = (await fetchFaqs()) || [];
  const active = cms.filter((f) => f.isActive !== false && f.question && f.answer);
  if (active.length) return [...active].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  return DEFAULT_FAQ_PAGE.map((f, i) => ({
    _id: `default-${i}`,
    question: f.question,
    answer: f.answer,
    category: f.category,
    sortOrder: i,
    isActive: true,
  }));
}

export default async function FaqPage() {
  const faqs = await loadFaqs();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema(faqs.map(({ question, answer }) => ({ question, answer })))) }}
      />
      <FaqClient initialFaqs={faqs} />
    </>
  );
}
