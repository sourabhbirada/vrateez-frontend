/**
 * Reels shown in the home page carousel (component/home/ReelsSection.tsx).
 * Each slug maps to two files in public/reels/:
 *   <slug>.mp4  720x1280 H.264, faststart (compressed from the masters in /marketing)
 *   <slug>.jpg  540x960 poster frame
 * Order here is the order they play in.
 */
export type Reel = {
  slug: string;
  title: string;
  caption: string;
  /** Short topic label shown as a chip. */
  tag: string;
  /** Set when the voiceover is not in English. */
  language?: string;
  /** Length in seconds. */
  duration: number;
  cta: { label: string; href: string };
};

/** Date the current set of reels was published, for structured data. */
export const REELS_PUBLISHED = '2026-11-03';

export const REELS: Reel[] = [
  {
    slug: 'brand-film',
    title: 'A short film about honest snacks',
    caption: 'From the grain to our kitchen in Jaipur to your door: baked in small batches and packed fresh to order.',
    tag: 'Our story',
    duration: 28.5,
    cta: { label: 'Read our story', href: '/about-us' },
  },
  {
    slug: 'diwali-reel-trending-30s',
    title: 'Still gifting sweets nobody eats?',
    caption: 'Swap the mithai box for a Diwali hamper of millet cookies and energy bars, now ₹379.',
    tag: 'Diwali',
    duration: 30,
    cta: { label: 'Shop the Diwali hamper', href: '/diwali' },
  },
  {
    slug: 'diwali-reel-30s',
    title: 'This Diwali, skip the sweets',
    caption: 'Energy bars, millet cookies, diyas and a greeting card in one box. Zero added sugar, no palm oil.',
    tag: 'Diwali offer',
    duration: 30,
    cta: { label: 'Shop the Diwali hamper', href: '/diwali' },
  },
];

export const reelVideo = (slug: string) => `/reels/${slug}.mp4`;
export const reelPoster = (slug: string) => `/reels/${slug}.jpg`;

export function formatDuration(seconds: number) {
  const s = Math.round(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
