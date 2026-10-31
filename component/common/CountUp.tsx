'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Counts a value like "10g", "₹379" or "400+" up from zero when it scrolls into view.
 * Non-numeric prefixes and suffixes are kept as-is.
 */
export default function CountUp({ value, duration = 1100, className }: { value: string; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const match = /^([^\d]*)(\d+(?:\.\d+)?)(.*)$/.exec(value.trim());
  const prefix = match?.[1] ?? '';
  const target = match ? Number(match[2]) : NaN;
  const suffix = match?.[3] ?? '';
  const decimals = match?.[2]?.includes('.') ? match[2].split('.')[1].length : 0;
  const [display, setDisplay] = useState<string>(Number.isNaN(target) ? value : `${prefix}${(0).toFixed(decimals)}${suffix}`);

  useEffect(() => {
    if (Number.isNaN(target)) return;
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || target === 0) {
      setDisplay(value);
      return;
    }

    let raf = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          setDisplay(`${prefix}${(target * eased).toFixed(decimals)}${suffix}`);
          if (t < 1) raf = requestAnimationFrame(tick);
          else setDisplay(value);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, target, prefix, suffix, decimals, duration]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
