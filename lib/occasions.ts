/**
 * Upcoming fasts and festivals the storefront promotes after Diwali 2026.
 *
 * Dates are for India and follow Drik Panchang. Ekadashi and Chhath dates depend on the
 * lunar tithi and can differ by a day locally, which the site tells visitors.
 * Occasions drop off the site automatically the day after they end, so add the next
 * season here before the list runs out (last entry ends 1 January 2027).
 */
export type OccasionKind = 'fast' | 'gifting';

export type Occasion = {
  id: string;
  name: string;
  kind: OccasionKind;
  /** First and last day, YYYY-MM-DD in India time. */
  start: string;
  end: string;
  /** Human date label, e.g. "Fri 20 Nov". */
  dateLabel: string;
  /** One or two sentences for cards. */
  blurb: string;
  /** Longer note for the occasions page. */
  detail: string;
  /** Two-line hero title; the second line gets the highlighter. */
  heroTitle: string;
  heroSubtitle: string;
  image: string;
  cta: { label: string; href: string };
};

export const OCCASIONS: Occasion[] = [
  {
    id: 'chhath-puja-2026',
    name: 'Chhath Puja',
    kind: 'fast',
    start: '2026-11-13',
    end: '2026-11-16',
    dateLabel: '13–16 Nov',
    blurb: 'Nahay Khay, Kharna and the 36-hour nirjala fast. Sattvic snacks with no onion or garlic for the family through all four days.',
    detail:
      'Chhath runs over four days: Nahay Khay on Friday 13 November, Kharna on Saturday 14, the evening Sandhya Arghya on Sunday 15 and the dawn Usha Arghya on Monday 16. Those keeping the 36-hour nirjala fast eat nothing in between, so our snacks are for the days around it and for the rest of the family: no onion, no garlic, no palm oil and no added sugar.',
    heroTitle: 'Sattvic snacks\nfor Chhath Puja.',
    heroSubtitle: 'No onion, no garlic, no added sugar. Snacks the whole family can share through all four days.',
    image: '/virteez/Coconut cookies in plate.jpeg',
    cta: { label: 'Shop vrat snacks', href: '/shop' },
  },
  {
    id: 'dev-uthani-ekadashi-2026',
    name: 'Dev Uthani Ekadashi',
    kind: 'fast',
    start: '2026-11-20',
    end: '2026-11-20',
    dateLabel: 'Fri 20 Nov',
    blurb: 'The Ekadashi that ends Chaturmas. Millet cookies, makhana and instant sama upma made without wheat, rice, onion or garlic.',
    detail:
      'Prabodhini or Dev Uthani Ekadashi falls on Friday 20 November and marks the end of Chaturmas. Some Vaishnava calendars observe it on Saturday 21. Our vrat range is made without wheat, rice, onion or garlic; fasting rules differ between families, so check each product’s ingredients against your own practice.',
    heroTitle: 'Fast clean this\nDev Uthani Ekadashi.',
    heroSubtitle: 'Millet cookies, makhana and instant sama upma, made without wheat, rice, onion or garlic.',
    image: '/virteez/All three infused cookies.jpeg',
    cta: { label: 'Shop Ekadashi snacks', href: '/shop' },
  },
  {
    id: 'tulsi-vivah-wedding-season-2026',
    name: 'Tulsi Vivah and wedding season',
    kind: 'gifting',
    start: '2026-11-21',
    end: '2027-02-28',
    dateLabel: 'From Sat 21 Nov',
    blurb: 'Tulsi Vivah opens the wedding season. Healthy shagun boxes and wedding favours with custom packaging, delivered pan-India.',
    detail:
      'Tulsi Vivah on Saturday 21 November traditionally opens the wedding season. For favours, shagun boxes and guest hampers we pack custom boxes with your choice of cookies, energy bars and makhana, with branded or personalised packaging and pan-India delivery.',
    heroTitle: 'Shagun boxes for\nthe wedding season.',
    heroSubtitle: 'Wedding favours and guest hampers with custom packaging. Zero added sugar, delivered pan-India.',
    image: '/virteez/Assorted cookie box.jpeg',
    cta: { label: 'Plan wedding favours', href: '/bulk-order' },
  },
  {
    id: 'utpanna-ekadashi-2026',
    name: 'Utpanna Ekadashi',
    kind: 'fast',
    start: '2026-12-04',
    end: '2026-12-04',
    dateLabel: 'Fri 4 Dec',
    blurb: 'Many devotees begin their year of Ekadashi fasting here. Stock up on vrat snacks that keep you full till the evening.',
    detail:
      'Utpanna Ekadashi falls on Friday 4 December and is traditionally where a year of Ekadashi fasting begins. Energy bars and protein cookies help through a long fasting day without a sugar crash.',
    heroTitle: 'Begin your\nEkadashi year well.',
    heroSubtitle: 'Energy bars and protein cookies for a long fasting day. Made without wheat, rice, onion or garlic.',
    image: '/virteez/Energy bar with packaging.jpeg',
    cta: { label: 'Shop vrat snacks', href: '/shop' },
  },
  {
    id: 'christmas-new-year-gifting-2026',
    name: 'Christmas and New Year gifting',
    kind: 'gifting',
    start: '2026-12-01',
    end: '2027-01-01',
    dateLabel: 'Dec – 1 Jan',
    blurb: 'Year-end hampers for teams and clients. Order by mid-December for pan-India delivery before the holidays.',
    detail:
      'Year-end gifting for teams, clients and family: hampers of millet cookies, energy bars and makhana with custom packaging and a printed note. Order by mid-December so every box arrives before the holidays.',
    heroTitle: 'Year-end gifts\npeople actually eat.',
    heroSubtitle: 'Hampers for teams and clients with custom packaging. Zero added sugar, delivered pan-India.',
    image: '/virteez/Cashew cookies in plate along with box.jpeg',
    cta: { label: 'Get a gifting quote', href: '/bulk-order' },
  },
  {
    id: 'mokshada-ekadashi-gita-jayanti-2026',
    name: 'Mokshada Ekadashi and Gita Jayanti',
    kind: 'fast',
    start: '2026-12-20',
    end: '2026-12-20',
    dateLabel: 'Sun 20 Dec',
    blurb: 'Gita Jayanti falls on Mokshada Ekadashi this year. Sattvic snacks for the fast and for the family.',
    detail:
      'Mokshada Ekadashi falls on Sunday 20 December, the same day as Gita Jayanti. Our snacks are sattvic, with no onion or garlic, and sweetened only with dates and fruit.',
    heroTitle: 'Sattvic snacks for\nMokshada Ekadashi.',
    heroSubtitle: 'No onion, no garlic, no added sugar. Made in small batches in Jaipur.',
    image: '/virteez/Walnut cookies in plate.jpeg',
    cta: { label: 'Shop vrat snacks', href: '/shop' },
  },
];

/** Today's date in India as YYYY-MM-DD. */
export function todayInIndia(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

/** Occasions that have not ended yet, soonest first. */
export function upcomingOccasions(now: Date = new Date()): Occasion[] {
  const today = todayInIndia(now);
  return OCCASIONS.filter((o) => o.end >= today).sort((a, b) => a.start.localeCompare(b.start));
}

/** True while the occasion is happening today. */
export function isOngoing(o: Occasion, now: Date = new Date()): boolean {
  const today = todayInIndia(now);
  return o.start <= today && today <= o.end;
}
