/**
 * Image URL resolver.
 *
 * The S3 bucket (vrateez.s3.ap-south-1.amazonaws.com) is suspended, so any
 * image URL pointing there is rewritten to the matching local copy under
 * /public/virteez. Unknown or empty URLs fall back to a placeholder.
 */

export const PLACEHOLDER_IMAGE = "/logo.png";

const S3_HOSTS = ["vrateez.s3.ap-south-1.amazonaws.com", "vrateez.s3.amazonaws.com", "s3.ap-south-1.amazonaws.com/vrateez"];

/** Files available under /public/virteez (kept in sync with the folder). */
export const LOCAL_IMAGE_FILES: string[] = [
  "All three infused cookies.jpeg",
  "Almond cookie box.jpeg",
  "Almond cookies in plate along with box.jpeg",
  "Almond cookies in plate.jpeg",
  "Assorted cookie box back side.jpeg",
  "Assorted cookie box left side.jpeg",
  "Assorted cookie box.jpeg",
  "Blueberry 4.jpeg",
  "Blueberry 5.jpeg",
  "Blueberry 6.jpeg",
  "Blueberry 7.jpeg",
  "Blueberry cookie box back side.jpeg",
  "Blueberry cookie box front side.jpeg",
  "Blueberry cookies 2.jpeg",
  "Blueberry cookies 3.jpeg",
  "Blueberry cookies.jpeg",
  "Cashew cookie box.jpeg",
  "Cashew cookies in plate along with box (2).jpeg",
  "Cashew cookies in plate along with box.jpeg",
  "Coconut cookie box.jpeg",
  "Coconut cookies in plate along with box.jpeg",
  "Coconut cookies in plate.jpeg",
  "Cranberry cookie box back side.jpeg",
  "Cranberry cookie box front side 2.jpeg",
  "Cranberry cookie box front side.jpeg",
  "Cranberry cookies.jpeg",
  "Desert date drops 2.jpeg",
  "Desert dates drops.jpeg",
  "Energy bar (1).jpeg",
  "Energy bar 2.jpeg",
  "Energy bar 3.jpeg",
  "Energy bar closeup.jpeg",
  "Energy bar pack back side.jpeg",
  "Energy bar side view.jpeg",
  "Energy bar with packaging.jpeg",
  "Energy bar.jpeg",
  "Walnut cookie box.jpeg",
  "Walnut cookies in plate.jpeg"
];

const LOCAL_SET = new Set(LOCAL_IMAGE_FILES.map((f) => f.toLowerCase()));

function decodeS3Key(url: string): string | null {
  for (const host of S3_HOSTS) {
    const idx = url.indexOf(host);
    if (idx !== -1) {
      let key = url.slice(idx + host.length);
      key = key.replace(/^\/+/, "").split("?")[0];
      try {
        key = decodeURIComponent(key.replace(/\+/g, " "));
      } catch {
        key = key.replace(/\+/g, " ");
      }
      return key;
    }
  }
  return null;
}

export function isS3Url(url?: string | null): boolean {
  return !!url && S3_HOSTS.some((h) => url.includes(h));
}

/**
 * Resolve any image URL to something that will actually load.
 */
export function resolveImage(url?: string | null, fallback: string = PLACEHOLDER_IMAGE): string {
  if (!url || typeof url !== "string" || !url.trim()) return fallback;
  const key = decodeS3Key(url);
  if (key === null) return url;
  const base = key.split("/").pop() || key;
  if (LOCAL_SET.has(base.toLowerCase())) return `/virteez/${base}`;
  return fallback;
}

/** Resolve a list of images, dropping empties and de-duplicating. */
export function resolveImages(urls?: Array<string | null | undefined> | null, fallback: string = PLACEHOLDER_IMAGE): string[] {
  const out: string[] = [];
  for (const u of urls || []) {
    const r = resolveImage(u, "");
    if (r && !out.includes(r)) out.push(r);
  }
  return out.length ? out : [fallback];
}
