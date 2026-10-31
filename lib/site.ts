export const SITE_NAME = 'Vrateez';
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vrateez.in').replace(/\/$/, '');
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

export function absoluteUrl(path: string) {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

export function truncate(text: string | undefined | null, max = 155) {
  const t = (text || '').replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).replace(/[\s,;:.]+\S*$/, '')}…`;
}
