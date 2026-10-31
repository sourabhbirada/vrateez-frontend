'use client';
import { useEffect, useState } from 'react';
import { X, Eye, EyeOff, Mail, Lock, UserIcon, Phone, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const inputClass =
    'w-full rounded-xl border border-ink/12 bg-white py-3.5 text-sm text-ink placeholder:text-ink/30 transition focus:border-turmeric focus:outline-none focus:ring-2 focus:ring-turmeric/30';
const labelClass = 'block font-label text-[10px] tracking-[0.22em] uppercase text-ink/55';
const iconClass = 'pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/35';

export default function AuthModal() {
    const {
        isLoginOpen,
        isSignup,
        closeAuth,
        login,
        signup,
        requestEmailOtp,
        verifyEmailOtp,
        pendingEmailOtp,
        clearPendingEmailOtp,
        openLogin,
        openSignup,
        isLoading,
        authError,
        clearError,
    } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [otp, setOtp] = useState('');

    // Escape closes the modal; the page behind stops scrolling while it is open
    useEffect(() => {
        if (!isLoginOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeAuth();
        };
        window.addEventListener('keydown', onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = prev;
        };
    }, [isLoginOpen, closeAuth]);

    if (!isLoginOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        if (pendingEmailOtp) {
            const ok = await verifyEmailOtp(pendingEmailOtp, otp.trim());
            if (!ok) return;
            setName('');
            setEmail('');
            setPassword('');
            setPhone('');
            setOtp('');
            return;
        }

        if (isSignup) {
            const result = await signup(name, email, password, phone.trim() || undefined);
            if (result === 'otp') {
                setPassword('');
                setOtp('');
                return;
            }
            if (result !== 'loggedIn') return;
        } else {
            const success = await login(email, password);
            if (!success) return;
        }

        setName('');
        setEmail('');
        setPassword('');
        setPhone('');
    };

    const eyebrow = pendingEmailOtp ? 'One more step' : isSignup ? 'New here' : 'Welcome back';
    const headline = pendingEmailOtp
        ? 'Verify your email.'
        : isSignup
            ? 'Create your account.'
            : 'Good to see you again.';
    const subcopy = pendingEmailOtp
        ? 'Enter the 6-digit code we sent to your inbox.'
        : isSignup
            ? 'Faster checkout, order tracking and first dibs on new launches.'
            : 'Log in to track orders and check out faster.';
    const ctaLabel = isLoading
        ? 'Please wait…'
        : pendingEmailOtp
            ? 'Verify code'
            : isSignup
                ? 'Create account'
                : 'Log in';

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-[2px]" onClick={closeAuth} />

            {/* Modal */}
            <div className="pointer-events-none fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="auth-modal-title"
                    className="pointer-events-auto flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-[26px] bg-parchment text-ink ring-1 ring-ink/[0.08] shadow-[0_32px_80px_-24px_rgba(36,31,22,0.55)] animate-slideUp sm:rounded-[26px]"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="relative px-7 pt-7 pb-5">
                        <div
                            className="pointer-events-none absolute -top-16 -right-16 h-44 w-44 rounded-full opacity-60 blur-3xl"
                            aria-hidden="true"
                            style={{ background: 'radial-gradient(circle, rgba(228,169,61,0.6) 0%, transparent 65%)' }}
                        />
                        <button
                            type="button"
                            onClick={closeAuth}
                            className="absolute top-4 right-4 inline-flex h-9 w-9 items-center justify-center rounded-full text-ink/60 transition hover:bg-ink/[0.06] hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-turmeric/40"
                            aria-label="Close"
                        >
                            <X size={18} />
                        </button>
                        <p className="font-label text-[10px] tracking-[0.22em] uppercase text-clay">{eyebrow}</p>
                        <h2 id="auth-modal-title" className="mt-2 font-display italic text-3xl leading-[1.05] text-ink">
                            {headline}
                        </h2>
                        <p className="mt-2 text-sm leading-relaxed text-ink/55">{subcopy}</p>
                    </div>

                    <div className="overflow-y-auto px-7 pb-7">
                        {/* Segmented control */}
                        {!pendingEmailOtp && (
                            <div
                                role="tablist"
                                aria-label="Log in or create account"
                                className="mb-5 grid grid-cols-2 rounded-full bg-ink/[0.06] p-1"
                            >
                                <button
                                    type="button"
                                    role="tab"
                                    aria-selected={!isSignup}
                                    onClick={openLogin}
                                    className={`rounded-full py-2 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-turmeric/40 ${
                                        !isSignup ? 'bg-white text-ink shadow-sm ring-1 ring-ink/[0.08]' : 'text-ink/55 hover:text-ink'
                                    }`}
                                >
                                    Log in
                                </button>
                                <button
                                    type="button"
                                    role="tab"
                                    aria-selected={isSignup}
                                    onClick={openSignup}
                                    className={`rounded-full py-2 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-turmeric/40 ${
                                        isSignup ? 'bg-white text-ink shadow-sm ring-1 ring-ink/[0.08]' : 'text-ink/55 hover:text-ink'
                                    }`}
                                >
                                    Create account
                                </button>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {pendingEmailOtp && (
                                <div>
                                    <label className={labelClass}>Email</label>
                                    <div className="mt-1.5 flex items-center gap-2.5 rounded-xl bg-white px-4 py-3 text-sm text-ink ring-1 ring-ink/[0.08]">
                                        <Mail size={15} className="shrink-0 text-turmeric" />
                                        <span className="truncate">{pendingEmailOtp}</span>
                                    </div>
                                </div>
                            )}

                            {!pendingEmailOtp && isSignup && (
                                <>
                                    <div>
                                        <label htmlFor="auth-name" className={labelClass}>Full name</label>
                                        <div className="relative mt-1.5">
                                            <UserIcon size={16} className={iconClass} />
                                            <input
                                                id="auth-name"
                                                type="text"
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                                placeholder="Your name"
                                                required
                                                autoComplete="name"
                                                className={`${inputClass} pl-11 pr-4`}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="auth-phone" className={labelClass}>Mobile (optional)</label>
                                        <div className="relative mt-1.5">
                                            <Phone size={16} className={iconClass} />
                                            <input
                                                id="auth-phone"
                                                type="tel"
                                                value={phone}
                                                onChange={e => setPhone(e.target.value)}
                                                placeholder="9876543210 — for order updates"
                                                autoComplete="tel"
                                                className={`${inputClass} pl-11 pr-4`}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {!pendingEmailOtp && (
                                <div>
                                    <label htmlFor="auth-email" className={labelClass}>Email</label>
                                    <div className="relative mt-1.5">
                                        <Mail size={16} className={iconClass} />
                                        <input
                                            id="auth-email"
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            placeholder="you@example.com"
                                            required
                                            autoComplete="email"
                                            className={`${inputClass} pl-11 pr-4`}
                                        />
                                    </div>
                                </div>
                            )}

                            {!pendingEmailOtp && (
                                <div>
                                    <label htmlFor="auth-password" className={labelClass}>Password</label>
                                    <div className="relative mt-1.5">
                                        <Lock size={16} className={iconClass} />
                                        <input
                                            id="auth-password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                            minLength={6}
                                            autoComplete={isSignup ? 'new-password' : 'current-password'}
                                            className={`${inputClass} pl-11 pr-12`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-ink/40 transition hover:bg-ink/[0.05] hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-turmeric/40"
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {pendingEmailOtp && (
                                <div>
                                    <label htmlFor="auth-otp" className={labelClass}>Verification code</label>
                                    <input
                                        id="auth-otp"
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="one-time-code"
                                        value={otp}
                                        onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder="••••••"
                                        required
                                        className={`${inputClass} mt-1.5 px-4 text-center font-label text-xl tracking-[0.45em] placeholder:tracking-[0.45em]`}
                                    />
                                    <div className="mt-2.5 flex items-center justify-between text-xs">
                                        <button
                                            type="button"
                                            onClick={() => requestEmailOtp(pendingEmailOtp)}
                                            className="font-semibold text-turmeric underline decoration-turmeric/30 underline-offset-4 transition hover:text-clay"
                                        >
                                            Resend code
                                        </button>
                                        <button
                                            type="button"
                                            onClick={clearPendingEmailOtp}
                                            className="text-ink/50 underline decoration-ink/20 underline-offset-4 transition hover:text-ink"
                                        >
                                            Use another email
                                        </button>
                                    </div>
                                </div>
                            )}

                            {authError && (
                                <p role="alert" className="rounded-xl bg-clay/10 px-3.5 py-3 text-sm text-clay ring-1 ring-clay/20">
                                    {authError}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group pressable flex w-full items-center justify-center gap-2 rounded-full bg-turmeric py-4 text-sm font-semibold text-parchment shadow-lg shadow-turmeric/25 transition hover:bg-clay disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                                {ctaLabel}
                                {!isLoading ? <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" /> : null}
                            </button>
                        </form>

                        {!pendingEmailOtp && (
                            <p className="mt-5 text-center text-xs text-ink/45">
                                {isSignup ? (
                                    <>
                                        Already have an account?{' '}
                                        <button type="button" onClick={openLogin} className="font-semibold text-turmeric transition hover:text-clay">
                                            Log in
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        New to Vrateez?{' '}
                                        <button type="button" onClick={openSignup} className="font-semibold text-turmeric transition hover:text-clay">
                                            Create an account
                                        </button>
                                    </>
                                )}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
