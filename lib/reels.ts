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
  // The two Diwali reels (diwali-reel-trending-30s, diwali-reel-30s) were retired after Diwali 2026.
  // Their files stay in public/reels for next year.
];

export const reelVideo = (slug: string) => `/reels/${slug}.mp4`;
export const reelPoster = (slug: string) => `/reels/${slug}.jpg`;

export function formatDuration(seconds: number) {
  const s = Math.round(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
