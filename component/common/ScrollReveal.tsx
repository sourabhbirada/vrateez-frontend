'use client';

import { useEffect } from 'react';

/**
 * Scroll-reveal for any element carrying `data-reveal`.
 * Optional `data-reveal-delay="120"` (ms) staggers siblings.
 *
 * Works for server and client rendered markup, including sections that mount
 * after data fetches. Without JavaScript nothing is hidden, because the hidden
 * state only applies once <html> has the `reveal-ready` class.
 */
export default function ScrollReveal() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    document.documentElement.classList.add('reveal-ready');

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          const delay = Number(el.dataset.revealDelay || 0);
          if (delay) el.style.transitionDelay = `${delay}ms`;
          el.classList.add('is-visible');
          io.unobserve(el);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );

    const watch = (root: ParentNode) => {
      root.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-visible):not([data-reveal-watched])').forEach((el) => {
        el.dataset.revealWatched = '1';
        io.observe(el);
      });
    };
    watch(document);

    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((n) => {
          if (n instanceof HTMLElement) {
            if (n.hasAttribute('data-reveal')) watch(n.parentNode || document);
            else watch(n);
          }
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
