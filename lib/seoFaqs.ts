/** Default storefront FAQs. Shown on the home page and emitted as FAQPage schema until FAQs exist in the CMS. */
export const DEFAULT_FAQS: Array<{ question: string; answer: string }> = [
  {
    question: 'Are Vrateez snacks really vrat friendly?',
    answer:
      'Yes. Everything is made without onion, garlic or grains like wheat and rice, using millets, nuts, seeds and fruit. Check each product page for the exact ingredient list.',
  },
  {
    question: 'How much sugar is in the cookies?',
    answer: 'Zero added sugar. Sweetness comes from the fruit, dates and nuts themselves.',
  },
  {
    question: 'Do you deliver everywhere in India?',
    answer:
      'Yes, we ship pan-India. Orders are packed fresh within 24 to 48 hours and you get a WhatsApp and email with the tracking number as soon as the courier picks it up.',
  },
  {
    question: 'Can I pay on delivery?',
    answer: 'Yes. Choose Cash on Delivery at checkout, or pay online by UPI, card or net banking through Razorpay.',
  },
  {
    question: 'How do I track my order?',
    answer: 'Open the Track Order page and enter your order ID or the courier tracking number. Live scan updates come straight from the courier.',
  },
  {
    question: 'Do you do corporate or festive gifting?',
    answer: 'Yes. Use the Bulk Order page for custom hampers, branded packaging and volume pricing. We reply within one working day.',
  },
];

export function faqPageSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}
