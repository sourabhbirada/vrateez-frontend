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

/**
 * Full FAQ page content used when the CMS has no FAQs yet. Grouped by topic.
 * Facts here must match the policy pages and Settings (delivery days, free-delivery threshold).
 */
export const DEFAULT_FAQ_PAGE: Array<{ category: string; question: string; answer: string }> = [
  {
    category: 'Vrat & ingredients',
    question: 'Are Vrateez snacks really vrat friendly?',
    answer:
      'Yes. Everything is made without onion, garlic, wheat, rice or maida. We use millets, nuts, seeds, dates and fruit. Fasting rules differ between families and fasts, so check the ingredient list on each product page before you order.',
  },
  {
    category: 'Vrat & ingredients',
    question: 'Can I eat Vrateez snacks during Navratri and Ekadashi?',
    answer:
      'Most customers eat them during Navratri, Ekadashi, Karwa Chauth and Monday fasts because they contain no grains, onion or garlic. If your fast excludes millets or specific nuts, read the ingredients tab on the product page first.',
  },
  {
    category: 'Vrat & ingredients',
    question: 'How much sugar is in the cookies?',
    answer: 'Zero added sugar. Sweetness comes from dates, fruit and nuts.',
  },
  {
    category: 'Vrat & ingredients',
    question: 'Do you use palm oil or preservatives?',
    answer: 'No palm oil, no maida and no artificial preservatives. Every bake is made in small batches in our FSSAI-certified kitchen in Jaipur.',
  },
  {
    category: 'Vrat & ingredients',
    question: 'Are the products gluten free?',
    answer:
      'Our recipes contain no wheat. They are made in a kitchen that handles nuts and millets, so if you have coeliac disease or a severe allergy, please message us before ordering.',
  },
  {
    category: 'Ordering & delivery',
    question: 'Do you deliver everywhere in India?',
    answer:
      'Yes, we ship pan-India. Orders are packed fresh within 24 to 48 hours and usually arrive in 3 to 5 business days. You get the tracking number by WhatsApp and email as soon as the courier picks it up.',
  },
  {
    category: 'Ordering & delivery',
    question: 'Is delivery free?',
    answer: 'Delivery is free on orders above ₹499. Below that, a flat shipping fee is shown at checkout before you pay.',
  },
  {
    category: 'Ordering & delivery',
    question: 'How do I track my order?',
    answer: 'Open the Track Order page and enter your order ID or the courier tracking number. Live scan updates come straight from the courier.',
  },
  {
    category: 'Ordering & delivery',
    question: 'My order arrived damaged. What do I do?',
    answer:
      'Message us on WhatsApp or email within 48 hours of delivery with a photo of the parcel and the product. We replace damaged or wrong items or refund them. The full details are on the Returns and refunds page.',
  },
  {
    category: 'Payments',
    question: 'Can I pay on delivery?',
    answer: 'Yes. Choose Cash on Delivery at checkout, or pay online by UPI, card or net banking through Razorpay.',
  },
  {
    category: 'Payments',
    question: 'Is online payment secure?',
    answer: 'Online payments are processed by Razorpay. We never see or store your card details.',
  },
  {
    category: 'Gifting & bulk orders',
    question: 'Do you do corporate or festive gifting?',
    answer: 'Yes. Use the Bulk Order page for custom hampers, branded packaging and volume pricing. We reply within one working day.',
  },
  {
    category: 'Gifting & bulk orders',
    question: 'Can I add a gift note?',
    answer: 'Yes. Add your message at checkout and we print it on a card inside the box.',
  },
];
