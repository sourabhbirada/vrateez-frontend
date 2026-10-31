import fs from 'node:fs';
import path from 'node:path';
import { Marked } from 'marked';

export type BlogFaq = { q: string; a: string };

export type BlogMeta = {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated?: string;
  cover?: string;
  coverAlt?: string;
  category?: string;
  keywords: string[];
  author: string;
  faq: BlogFaq[];
  draft?: boolean;
};

export type TocItem = { id: string; text: string; depth: number };

export type BlogPost = BlogMeta & {
  html: string;
  toc: TocItem[];
  readingMinutes: number;
  excerpt: string;
};

const CONTENT_DIR = path.join(process.cwd(), 'content', 'blog');

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/** Minimal front matter parser: `key: value`, arrays as `[a, b]` or JSON, strings optionally quoted. */
function parseFrontMatter(raw: string): { data: Record<string, unknown>; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
  if (!match) return { data: {}, body: raw };
  const data: Record<string, unknown> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx === -1 || line.trim().startsWith('#')) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (!key) continue;
    if ((value.startsWith('[') && value.endsWith(']')) || value.startsWith('{')) {
      try {
        data[key] = JSON.parse(value);
        continue;
      } catch {
        data[key] = value
          .slice(1, -1)
          .split(',')
          .map((s) => s.trim().replace(/^["']|["']$/g, ''))
          .filter(Boolean);
        continue;
      }
    }
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    data[key] = value === 'true' ? true : value === 'false' ? false : value;
  }
  return { data, body: match[2] };
}

function createRenderer(toc: TocItem[]) {
  const marked = new Marked({ gfm: true, breaks: false });
  marked.use({
    renderer: {
      heading({ tokens, depth }) {
        const text = this.parser.parseInline(tokens);
        const plain = text.replace(/<[^>]+>/g, '');
        const id = slugify(plain);
        if (depth === 2 || depth === 3) toc.push({ id, text: plain, depth });
        return `<h${depth} id="${id}">${text}</h${depth}>\n`;
      },
      link({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens);
        const external = /^https?:\/\//i.test(href) && !/vrateez\.in/i.test(href);
        const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : '';
        return `<a href="${href}"${title ? ` title="${title}"` : ''}${attrs}>${text}</a>`;
      },
      table({ header, rows }) {
        const th = header.map((c) => `<th>${this.parser.parseInline(c.tokens)}</th>`).join('');
        const body = rows
          .map((r) => `<tr>${r.map((c) => `<td>${this.parser.parseInline(c.tokens)}</td>`).join('')}</tr>`)
          .join('');
        return `<div class="table-wrap"><table><thead><tr>${th}</tr></thead><tbody>${body}</tbody></table></div>\n`;
      },
    },
  });
  return marked;
}

function readPostFile(file: string): BlogPost | null {
  const slug = file.replace(/\.md$/, '');
  const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8');
  const { data, body } = parseFrontMatter(raw);
  if (data.draft === true) return null;

  const toc: TocItem[] = [];
  const html = createRenderer(toc).parse(body) as string;
  const words = body.replace(/[#>*_`|\-]/g, ' ').split(/\s+/).filter(Boolean).length;
  const firstPara = body
    .split(/\r?\n\r?\n/)
    .map((p) => p.trim())
    .find((p) => p && !p.startsWith('#') && !p.startsWith('|') && !p.startsWith('!'));

  return {
    slug,
    title: String(data.title || slug),
    description: String(data.description || ''),
    date: String(data.date || ''),
    updated: data.updated ? String(data.updated) : undefined,
    cover: data.cover ? String(data.cover) : undefined,
    coverAlt: data.coverAlt ? String(data.coverAlt) : undefined,
    category: data.category ? String(data.category) : undefined,
    keywords: Array.isArray(data.keywords) ? (data.keywords as string[]) : [],
    author: String(data.author || 'Vrateez Team'),
    faq: Array.isArray(data.faq) ? (data.faq as BlogFaq[]) : [],
    html,
    toc,
    readingMinutes: Math.max(1, Math.round(words / 220)),
    excerpt: (firstPara || '').replace(/[*_`]/g, '').slice(0, 200),
  };
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.md'))
    .map(readPostFile)
    .filter((p): p is BlogPost => Boolean(p))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): BlogPost | null {
  const file = `${slug}.md`;
  if (!fs.existsSync(path.join(CONTENT_DIR, file))) return null;
  return readPostFile(file);
}

export function formatPostDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
}
