'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, Play, Volume2, VolumeX } from 'lucide-react';
import { REELS, reelPoster, reelVideo } from '@/lib/reels';

const N = REELS.length;

/** Signed distance of reel i from the centre reel, wrapping round so the carousel loops. */
function offsetFrom(i: number, active: number) {
  let d = (i - active) % N;
  if (d > N / 2) d -= N;
  if (d < -N / 2) d += N;
  return d;
}

/** Where a card sits for each distance from the centre. x is in card widths. */
const SLOTS = [
  { x: 0, scale: 1, opacity: 1, z: 30 },
  { x: 0.96, scale: 0.84, opacity: 1, z: 20 },
  { x: 1.78, scale: 0.7, opacity: 0.7, z: 10 },
  { x: 2.45, scale: 0.58, opacity: 0, z: 0 },
];

/** How long a reel stays in the centre when the browser refuses to play it. */
const FALLBACK_MS = 5000;

/**
 * Home page reels: a horizontal carousel with the playing reel in the middle and the
 * others peeking either side. Each reel plays once, muted until the viewer turns sound on,
 * then the next one slides into the middle; after the last it starts again from the first.
 * Nothing loads until the section nears the screen, and playback pauses when it leaves.
 */
export default function ReelsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dotFillRef = useRef<HTMLSpanElement>(null);
  const mutedRef = useRef(true);
  const swipeRef = useRef<{ x: number; y: number; swiped: boolean } | null>(null);

  const [active, setActive] = useState(0);
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  const [muted, setMuted] = useState(true);
  const [soundTouched, setSoundTouched] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [blocked, setBlocked] = useState(false);
  // Direction of the last move. The card that arrives on that side has wrapped round from the
  // other end, so it travels behind the others instead of across the front.
  const [dir, setDir] = useState<1 | -1>(1);

  const goTo = (index: number) => {
    const d = offsetFrom(index, active);
    if (d === 0) return;
    setDir(d > 0 ? 1 : -1);
    setActive(index);
    setUserPaused(false);
  };
  const next = useCallback(() => {
    setDir(1);
    setActive((a) => (a + 1) % N);
    setUserPaused(false);
  }, []);
  const prev = useCallback(() => {
    setDir(-1);
    setActive((a) => (a - 1 + N) % N);
    setUserPaused(false);
  }, []);

  // Start loading when the section is close, play only while it is mostly on screen.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const nearIo = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          nearIo.disconnect();
        }
      },
      { rootMargin: '400px 0px' },
    );
    const visibleIo = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.35 });
    nearIo.observe(el);
    visibleIo.observe(el);
    return () => {
      nearIo.disconnect();
      visibleIo.disconnect();
    };
  }, []);

  const startPlayback = useCallback((video: HTMLVideoElement) => {
    const attempt = video.play();
    if (!attempt) return;
    attempt
      .then(() => setBlocked(false))
      .catch((err: DOMException) => {
        // Interrupted by a pause() or a newer play(): nothing to recover.
        if (err?.name === 'AbortError') return;
        if (!video.muted) {
          // Sound was refused, so carry on muted.
          video.muted = true;
          mutedRef.current = true;
          setMuted(true);
          video.play().catch(() => setBlocked(true));
          return;
        }
        // Even muted autoplay is off (e.g. iOS Low Power Mode): show the poster and move on by timer.
        setBlocked(true);
      });
  }, []);

  // Play the centre reel; pause and rewind the others.
  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (!video || i === active) return;
      if (!video.paused) video.pause();
      if (video.currentTime > 0) video.currentTime = 0;
    });
    const video = videoRefs.current[active];
    if (!video) return;
    if (visible && !userPaused && !document.hidden) {
      video.muted = mutedRef.current;
      startPlayback(video);
    } else if (!video.paused) {
      video.pause();
    }
  }, [active, visible, near, userPaused, startPlayback]);

  // When the browser will not play video at all, still move along.
  useEffect(() => {
    if (!blocked || !visible || userPaused) return;
    const t = window.setTimeout(next, FALLBACK_MS);
    return () => window.clearTimeout(t);
  }, [blocked, visible, userPaused, active, next]);

  // Pause while the tab is hidden.
  useEffect(() => {
    const onVisibility = () => {
      const video = videoRefs.current[active];
      if (!video) return;
      if (document.hidden) video.pause();
      else if (visible && !userPaused) startPlayback(video);
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [active, visible, userPaused, startPlayback]);

  // Progress on the centre card and its dot, updated per frame without re-rendering.
  useEffect(() => {
    if (!visible) return;
    let raf = 0;
    const tick = () => {
      const video = videoRefs.current[active];
      const fraction = video && video.duration ? Math.min(1, video.currentTime / video.duration) : 0;
      const bar = barRefs.current[active];
      if (bar) bar.style.transform = `scaleX(${fraction})`;
      if (dotFillRef.current) dotFillRef.current.style.transform = `scaleX(${fraction})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, visible]);

  const togglePlay = () => {
    const video = videoRefs.current[active];
    if (!video) return;
    if (video.paused) {
      setUserPaused(false);
      startPlayback(video);
    } else {
      video.pause();
      setUserPaused(true);
    }
  };

  // Sound is switched inside the tap itself: iOS only lets a video gain sound during a gesture.
  const toggleMute = () => {
    const nextMuted = !mutedRef.current;
    mutedRef.current = nextMuted;
    videoRefs.current.forEach((video) => {
      if (video) video.muted = nextMuted;
    });
    setMuted(nextMuted);
    setSoundTouched(true);
    const video = videoRefs.current[active];
    if (video?.paused && !userPaused) startPlayback(video);
  };

  // Horizontal swipe on touch screens; vertical drags still scroll the page.
  const onPointerDown = (e: React.PointerEvent) => {
    swipeRef.current = { x: e.clientX, y: e.clientY, swiped: false };
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const start = swipeRef.current;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      start.swiped = true;
      if (dx < 0) next();
      else prev();
    }
  };
  /** True (and resets) when the click that follows a pointer-up was really the end of a swipe. */
  const consumeSwipe = () => {
    const swiped = swipeRef.current?.swiped ?? false;
    swipeRef.current = null;
    return swiped;
  };

  return (
    <section
      ref={sectionRef}
      aria-roledescription="carousel"
      aria-label="Vrateez reels"
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          next();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          prev();
        }
      }}
      className="relative overflow-hidden bg-ink py-16 text-parchment md:py-20"
    >
      <div className="grain-overlay pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-turmeric/20 blur-[120px]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-6 md:px-8">
        <div className="mx-auto max-w-xl text-center" data-reveal>
          <p className="mb-3 font-label text-[10px] uppercase tracking-[0.24em] text-millet">Vrateez Reels</p>
          <h2 className="font-display text-4xl italic leading-none text-parchment md:text-5xl">Watch, snack, repeat.</h2>
          <p className="mt-4 text-sm leading-relaxed text-parchment/60">
            A look inside our kitchen in Jaipur, and a better Diwali gift than another box of mithai.
          </p>
        </div>
      </div>

      {/* Stage */}
      <div
        className="relative mt-10 [--reel-w:clamp(210px,60vw,290px)] md:mt-12"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        style={{ touchAction: 'pan-y' }}
      >
        <div className="relative mx-auto h-[calc(var(--reel-w)*16/9)]">
          {REELS.map((reel, i) => {
            const d = offsetFrom(i, active);
            const slot = SLOTS[Math.min(Math.abs(d), SLOTS.length - 1)];
            const isCenter = d === 0;
            const hidden = slot.opacity === 0;
            const hasVideo = near && Math.abs(d) <= 1;
            return (
              <div
                key={reel.slug}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${N}: ${reel.title}`}
                aria-hidden={hidden || undefined}
                className={`absolute left-1/2 top-0 h-full w-[var(--reel-w)] transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.22,0.8,0.24,1)] motion-reduce:duration-0 ${
                  hidden ? 'pointer-events-none' : ''
                }`}
                style={{
                  transform: `translateX(calc(-50% + ${Math.sign(d) * slot.x} * var(--reel-w))) scale(${slot.scale})`,
                  opacity: slot.opacity,
                  zIndex: d === dir ? 5 : slot.z,
                }}
              >
                <div
                  className={`relative h-full w-full overflow-hidden rounded-[24px] bg-black ring-1 transition-shadow duration-700 ${
                    isCenter
                      ? 'shadow-[0_40px_90px_-30px_rgba(0,0,0,0.85)] ring-millet/40'
                      : 'shadow-[0_20px_50px_-30px_rgba(0,0,0,0.8)] ring-white/10'
                  }`}
                >
                  <Image
                    src={reelPoster(reel.slug)}
                    alt=""
                    fill
                    sizes="290px"
                    className="object-cover"
                    loading={Math.abs(d) <= 2 ? 'eager' : 'lazy'}
                  />

                  {hasVideo && (
                    <video
                      ref={(el) => {
                        videoRefs.current[i] = el;
                      }}
                      src={reelVideo(reel.slug)}
                      poster={reelPoster(reel.slug)}
                      preload="auto"
                      muted={muted}
                      playsInline
                      disablePictureInPicture
                      onEnded={isCenter ? next : undefined}
                      aria-label={reel.title}
                      // Side cards keep their video loaded but show the poster: a rewound video
                      // would show its first frame, which is often a blank background.
                      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                        isCenter ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                  )}

                  {isCenter ? (
                    <>
                      {/* Tap the reel to pause or play */}
                      <button
                        type="button"
                        onClick={() => {
                          if (!consumeSwipe()) togglePlay();
                        }}
                        aria-label={userPaused ? `Play ${reel.title}` : `Pause ${reel.title}`}
                        className="absolute inset-0 z-[1] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-millet"
                      />

                      {(userPaused || blocked) && (
                        <span className="pointer-events-none absolute left-1/2 top-1/2 z-[2] flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 ring-1 ring-white/25 backdrop-blur-md">
                          <Play size={28} className="ml-1" fill="currentColor" />
                        </span>
                      )}

                      <div className="pointer-events-none absolute inset-x-0 top-0 z-[2] flex items-start justify-between bg-gradient-to-b from-black/50 to-transparent p-3 pb-10">
                        <span className="rounded-full bg-black/35 px-2.5 py-1 font-label text-[9px] uppercase tracking-[0.16em] text-white/90 ring-1 ring-white/15 backdrop-blur-sm">
                          {reel.tag}
                          {reel.language ? ` · ${reel.language}` : ''}
                        </span>
                        <button
                          type="button"
                          onClick={toggleMute}
                          aria-label={muted ? 'Turn sound on' : 'Mute'}
                          aria-pressed={!muted}
                          className="pointer-events-auto inline-flex h-9 items-center gap-1.5 rounded-full bg-black/40 px-2.5 text-[11px] font-medium text-white ring-1 ring-white/20 backdrop-blur-md transition hover:bg-black/60"
                        >
                          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                          {muted && !soundTouched && <span>Tap for sound</span>}
                        </button>
                      </div>

                      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] bg-gradient-to-t from-black/85 via-black/40 to-transparent px-4 pb-5 pt-20">
                        <h3 className="font-display text-lg leading-snug text-white">{reel.title}</h3>
                        <Link
                          href={reel.cta.href}
                          className="pointer-events-auto mt-3 inline-flex items-center gap-1 rounded-full bg-saffron px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-rust active:scale-[0.98]"
                        >
                          {reel.cta.label}
                          <ArrowUpRight size={14} />
                        </Link>
                      </div>

                      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-[3px] bg-white/20">
                        <div
                          ref={(el) => {
                            barRefs.current[i] = el;
                          }}
                          className="h-full origin-left bg-millet"
                          style={{ transform: 'scaleX(0)' }}
                        />
                      </div>
                    </>
                  ) : (
                    <button
                      type="button"
                      tabIndex={hidden ? -1 : 0}
                      onClick={() => {
                        if (!consumeSwipe()) goTo(i);
                      }}
                      aria-label={`Play ${reel.title}`}
                      className="group absolute inset-0 z-[1] flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/25 to-black/30 p-3 text-left transition hover:from-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-millet"
                    >
                      <span className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 ring-1 ring-white/25 backdrop-blur-sm transition group-hover:scale-110">
                        <Play size={18} className="ml-0.5" fill="currentColor" />
                      </span>
                      <span className="line-clamp-2 font-display text-[15px] leading-snug text-white/90">{reel.title}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Arrows beside the cards (tablet and up) */}
        <button
          type="button"
          onClick={prev}
          aria-label="Previous reel"
          style={{ left: 'max(1rem, calc(50% - var(--reel-w) * 1.4 - 4.5rem))' }}
          className="absolute top-1/2 z-40 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-parchment text-ink shadow-lg transition hover:bg-white active:scale-95 md:inline-flex"
        >
          <ChevronLeft size={22} />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Next reel"
          style={{ right: 'max(1rem, calc(50% - var(--reel-w) * 1.4 - 4.5rem))' }}
          className="absolute top-1/2 z-40 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-parchment text-ink shadow-lg transition hover:bg-white active:scale-95 md:inline-flex"
        >
          <ChevronRight size={22} />
        </button>
      </div>

      {/* Dots: the current one fills as its reel plays. Phones also get arrows here. */}
      <div className="relative mt-8 flex items-center justify-center gap-1.5 px-6">
        <button
          type="button"
          onClick={prev}
          aria-label="Previous reel"
          className="mr-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-parchment/10 text-parchment ring-1 ring-parchment/20 transition active:scale-95 md:hidden"
        >
          <ChevronLeft size={20} />
        </button>
        {REELS.map((reel, i) => (
          <button
            key={reel.slug}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Show reel ${i + 1}: ${reel.title}`}
            aria-current={i === active ? 'true' : undefined}
            className="group flex h-6 items-center"
          >
            <span
              className={`relative block h-1.5 overflow-hidden rounded-full transition-all duration-500 ${
                i === active ? 'w-8 bg-parchment/20' : 'w-1.5 bg-parchment/30 group-hover:bg-parchment/60'
              }`}
            >
              {i === active && (
                <span
                  ref={dotFillRef}
                  className="absolute inset-0 origin-left rounded-full bg-millet"
                  style={{ transform: 'scaleX(0)' }}
                />
              )}
            </span>
          </button>
        ))}
        <button
          type="button"
          onClick={next}
          aria-label="Next reel"
          className="ml-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-parchment/10 text-parchment ring-1 ring-parchment/20 transition active:scale-95 md:hidden"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  );
}
