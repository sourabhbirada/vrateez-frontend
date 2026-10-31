'use client';

import Link from 'next/link';
import Image from 'next/image';
import { createPortal } from 'react-dom';
import { ShoppingCart, User, Search, Menu, X, LogOut, Package, MessageCircle, ArrowUpRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useSettings, whatsappLink } from '@/context/SettingsContext';
import { useState, useRef, useEffect, useCallback, useSyncExternalStore } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import SearchModal from '@/component/search/SearchModal';

const noopSubscribe = () => () => {};
const subscribeScroll = (onChange: () => void) => {
    window.addEventListener('scroll', onChange, { passive: true });
    return () => window.removeEventListener('scroll', onChange);
};

const NAV_LINKS = [
    { href: '/shop', label: 'Shop' },
    { href: '/track-order', label: 'Track order' },
    { href: '/bulk-order', label: 'Bulk order' },
    { href: '/faq', label: 'FAQ' },
    { href: '/about-us', label: 'About' },
];

const FALLBACK_WHATSAPP = '916375010189';

export default function Header() {
    const { totalItems, toggleCart, hydrated } = useCart();
    const { user, openLogin, logout } = useAuth();
    const { settings } = useSettings();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchOpen, setSearchOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [badgePop, setBadgePop] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const pathname = usePathname();

    // Client-only flags: false during SSR and hydration, live values afterwards
    const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
    const scrolled = useSyncExternalStore(subscribeScroll, () => window.scrollY > 50, () => false);

    // Close menus on route change (state adjusted during render, see "storing information from previous renders")
    const [prevPathname, setPrevPathname] = useState(pathname);
    if (pathname !== prevPathname) {
        setPrevPathname(pathname);
        setMobileOpen(false);
        setUserMenuOpen(false);
    }

    // Pop the cart badge when the count changes, but not on the initial cart hydration
    const [prevTotal, setPrevTotal] = useState(totalItems);
    const [prevHydrated, setPrevHydrated] = useState(hydrated);
    if (hydrated !== prevHydrated) {
        setPrevHydrated(hydrated);
        setPrevTotal(totalItems);
    } else if (totalItems !== prevTotal) {
        setPrevTotal(totalItems);
        if (hydrated && totalItems > 0) setBadgePop(true);
    }
    useEffect(() => {
        if (!badgePop) return;
        const t = window.setTimeout(() => setBadgePop(false), 320);
        return () => window.clearTimeout(t);
    }, [badgePop]);

    // Close user menu on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Lock body scroll + Escape to close while the mobile menu is open
    useEffect(() => {
        if (!mobileOpen) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setMobileOpen(false);
        };
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener('keydown', onKey);
        };
    }, [mobileOpen]);

    const closeSearch = useCallback(() => setSearchOpen(false), []);

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
            setSearchOpen(false);
            setMobileOpen(false);
        }
    };

    const isActive = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(`${href}/`));

    // Values that depend on client-only state render neutral until mounted (hydration safety)
    const currentUser = mounted ? user : null;
    const count = mounted ? totalItems : 0;
    const compact = scrolled;

    const whatsappHref =
        whatsappLink(settings?.contact?.whatsapp) ||
        whatsappLink(FALLBACK_WHATSAPP) ||
        `https://wa.me/${FALLBACK_WHATSAPP}`;

    // Logo sits on a dark ink plate so the gold mark stays readable on the parchment header.
    const logo = (
        <div
            className={`relative overflow-hidden rounded-xl bg-ink ring-1 ring-ink/40 shadow-sm transition-all duration-300 ${
                compact ? 'h-10 w-[108px] p-1' : 'h-12 w-[136px] p-1.5 md:h-16 md:w-[176px]'
            }`}
        >
            <div className="relative h-full w-full">
                <Image
                    src="/logo.png"
                    alt="Vrateez — nourish your fasting"
                    fill
                    className="object-contain"
                    sizes="(min-width: 768px) 176px, 136px"
                    priority
                />
            </div>
        </div>
    );

    const iconButton =
        'relative inline-flex h-10 w-10 items-center justify-center rounded-full text-ink transition hover:bg-ink/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-turmeric/40';

    const mobileMenu = (
        <div
            className={`fixed inset-0 z-50 transition-[visibility] duration-300 md:hidden ${
                mobileOpen ? 'visible' : 'pointer-events-none invisible'
            }`}
            aria-hidden={!mobileOpen}
        >
            {/* Overlay */}
            <div
                className={`absolute inset-0 bg-ink/50 backdrop-blur-[2px] transition-opacity duration-300 ${
                    mobileOpen ? 'opacity-100' : 'opacity-0'
                }`}
                onClick={() => setMobileOpen(false)}
            />

            {/* Panel */}
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Menu"
                className={`absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col bg-parchment text-ink shadow-2xl transition-transform duration-300 ease-out ${
                    mobileOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex items-center justify-between px-5 pt-4 pb-3">
                    <p className="font-label text-[10px] tracking-[0.22em] uppercase text-clay">Menu</p>
                    <button
                        type="button"
                        onClick={() => setMobileOpen(false)}
                        className={iconButton}
                        aria-label="Close menu"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-5 pb-6">
                    {/* Mobile Search */}
                    <form onSubmit={handleSearch} role="search">
                        <label htmlFor="mobile-nav-search" className="sr-only">
                            Search products
                        </label>
                        <div className="relative">
                            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/35" />
                            <input
                                id="mobile-nav-search"
                                type="search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search cookies, bars, millet…"
                                className="w-full rounded-xl border border-ink/12 bg-white py-3.5 pl-11 pr-4 text-sm text-ink placeholder:text-ink/30 focus:border-turmeric focus:outline-none focus:ring-2 focus:ring-turmeric/30"
                            />
                        </div>
                    </form>

                    <nav className="mt-6 flex flex-col" aria-label="Mobile">
                        {NAV_LINKS.map((item) => {
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileOpen(false)}
                                    aria-current={active ? 'page' : undefined}
                                    className="group flex items-center justify-between border-b border-ink/[0.08] py-3.5"
                                >
                                    <span
                                        className={`font-display italic text-[1.9rem] leading-none tracking-[-0.01em] transition-colors ${
                                            active ? 'text-turmeric' : 'text-ink group-hover:text-clay'
                                        }`}
                                    >
                                        {item.label}
                                    </span>
                                    <ArrowUpRight
                                        size={18}
                                        className={`transition ${active ? 'text-turmeric' : 'text-ink/25 group-hover:text-clay'}`}
                                    />
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Account row */}
                    <div className="mt-6 rounded-[22px] bg-white p-4 ring-1 ring-ink/[0.08]">
                        {currentUser ? (
                            <>
                                <div className="flex items-center gap-3">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-turmeric text-sm font-bold text-parchment">
                                        {currentUser.name[0]?.toUpperCase()}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-ink">{currentUser.name}</p>
                                        <p className="truncate text-xs text-ink/45">{currentUser.email}</p>
                                    </div>
                                </div>
                                <div className="mt-4 grid grid-cols-2 gap-2">
                                    <Link
                                        href="/account/orders"
                                        onClick={() => setMobileOpen(false)}
                                        className="inline-flex items-center justify-center gap-1.5 rounded-full bg-ink px-4 py-2.5 text-xs font-semibold text-parchment transition hover:bg-turmeric"
                                    >
                                        <Package size={14} />
                                        My orders
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            logout();
                                            setMobileOpen(false);
                                        }}
                                        className="inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-semibold text-clay ring-1 ring-clay/25 transition hover:bg-clay/10"
                                    >
                                        <LogOut size={14} />
                                        Log out
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold text-ink">Your account</p>
                                    <p className="text-xs text-ink/45">Track orders and check out faster.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMobileOpen(false);
                                        openLogin();
                                    }}
                                    className="pressable inline-flex shrink-0 items-center gap-1.5 rounded-full bg-turmeric px-4 py-2.5 text-xs font-semibold text-parchment shadow-lg shadow-turmeric/25 transition hover:bg-clay"
                                >
                                    <User size={14} />
                                    Log in
                                </button>
                            </div>
                        )}
                    </div>

                    {/* WhatsApp row */}
                    <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 flex items-center gap-3 rounded-[22px] bg-basil px-4 py-3.5 text-parchment transition hover:bg-basil/90"
                    >
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366] text-white">
                            <MessageCircle size={16} fill="currentColor" />
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold leading-tight">Chat with us on WhatsApp</span>
                            <span className="block text-[11px] text-parchment/60">Orders, bulk pricing, vrat questions</span>
                        </span>
                        <ArrowUpRight size={16} className="text-parchment/60" />
                    </a>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <header
                className={`sticky top-0 z-30 border-b transition-all duration-300 ${
                    compact
                        ? 'border-ink/[0.08] bg-parchment/90 py-2 shadow-[0_1px_0_rgba(36,31,22,0.04)] backdrop-blur-md'
                        : 'border-transparent bg-parchment py-3 md:py-3.5'
                }`}
            >
                <div className="mx-auto max-w-7xl px-4 md:px-6">
                    <div className="flex items-center justify-between gap-3">
                        {/* Left: Nav links (desktop) */}
                        <nav className="hidden flex-1 items-center gap-1 md:flex" aria-label="Primary">
                            {NAV_LINKS.map((item) => {
                                const active = isActive(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        aria-current={active ? 'page' : undefined}
                                        className={`group relative whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-turmeric/40 ${
                                            active ? 'text-ink' : 'text-ink/70 hover:text-ink'
                                        }`}
                                    >
                                        {item.label}
                                        <span
                                            aria-hidden="true"
                                            className={`absolute left-3 right-3 bottom-0.5 h-[2px] origin-left rounded-full bg-turmeric transition-transform duration-300 ease-out ${
                                                active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                                            }`}
                                        />
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Mobile: menu button */}
                        <div className="flex flex-1 items-center md:hidden">
                            <button
                                type="button"
                                className={iconButton}
                                onClick={() => setMobileOpen(true)}
                                aria-label="Open menu"
                                aria-expanded={mobileOpen}
                            >
                                <Menu size={22} strokeWidth={1.75} />
                            </button>
                        </div>

                        {/* Center: Logo */}
                        <Link href="/" className="flex-shrink-0 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-turmeric/40" aria-label="Vrateez home">
                            {logo}
                        </Link>

                        {/* Right: Search + User + Cart */}
                        <div className="flex flex-1 items-center justify-end gap-0.5 sm:gap-1">
                            <button
                                type="button"
                                onClick={() => setSearchOpen(true)}
                                className={iconButton}
                                aria-label="Search products"
                            >
                                <Search size={19} strokeWidth={1.75} />
                            </button>

                            {/* User / Auth */}
                            <div className="relative" ref={userMenuRef}>
                                {currentUser ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                                            className={iconButton}
                                            aria-label="Account menu"
                                            aria-haspopup="menu"
                                            aria-expanded={userMenuOpen}
                                        >
                                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-turmeric text-xs font-bold text-parchment ring-2 ring-parchment">
                                                {currentUser.name[0]?.toUpperCase()}
                                            </span>
                                        </button>
                                        {userMenuOpen && (
                                            <div
                                                role="menu"
                                                className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl bg-white ring-1 ring-ink/[0.08] shadow-[0_24px_50px_-24px_rgba(36,31,22,0.45)] animate-fadeIn"
                                            >
                                                <div className="border-b border-ink/[0.08] px-4 py-3">
                                                    <p className="font-label text-[10px] tracking-[0.22em] uppercase text-clay">Signed in</p>
                                                    <p className="mt-1 truncate text-sm font-semibold text-ink">{currentUser.name}</p>
                                                    <p className="truncate text-xs text-ink/45">{currentUser.email}</p>
                                                </div>
                                                <Link
                                                    href="/account/orders"
                                                    role="menuitem"
                                                    onClick={() => setUserMenuOpen(false)}
                                                    className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-ink transition hover:bg-parchment/70"
                                                >
                                                    <Package size={15} className="text-turmeric" />
                                                    My orders
                                                </Link>
                                                <button
                                                    type="button"
                                                    role="menuitem"
                                                    onClick={() => {
                                                        logout();
                                                        setUserMenuOpen(false);
                                                    }}
                                                    className="flex w-full items-center gap-2.5 border-t border-ink/[0.08] px-4 py-3 text-sm text-clay transition hover:bg-clay/[0.06]"
                                                >
                                                    <LogOut size={15} />
                                                    Log out
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={openLogin}
                                        className={iconButton}
                                        aria-label="Log in"
                                    >
                                        <User size={19} strokeWidth={1.75} />
                                    </button>
                                )}
                            </div>

                            {/* Cart */}
                            <button
                                type="button"
                                onClick={toggleCart}
                                className={iconButton}
                                aria-label={count > 0 ? `Open cart, ${count} item${count === 1 ? '' : 's'}` : 'Open cart'}
                            >
                                <ShoppingCart size={19} strokeWidth={1.75} />
                                {count > 0 && (
                                    <span
                                        className={`absolute -top-0.5 -right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-millet px-1 text-[10px] font-bold leading-none text-ink ring-2 ring-parchment transition-transform duration-300 ease-out ${
                                            badgePop ? 'scale-[1.35]' : 'scale-100'
                                        }`}
                                        aria-hidden="true"
                                    >
                                        {count > 99 ? '99+' : count}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Portaled overlays so they escape the sticky header's stacking context */}
            {mounted && createPortal(mobileMenu, document.body)}
            {mounted && createPortal(<SearchModal isOpen={searchOpen} onClose={closeSearch} />, document.body)}
        </>
    );
}
