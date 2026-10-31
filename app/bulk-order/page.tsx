'use client';

import Image from 'next/image';
import { useState, type ReactNode } from 'react';
import {
    Check,
    CheckCircle2,
    ChevronDown,
    Clock,
    Loader2,
    Mail,
    MapPin,
    MessageCircle,
    Package,
    Phone,
    Send,
    Truck,
    Users,
} from 'lucide-react';
import { apiUrl } from '@/lib/api/config';
import { useSettings, whatsappLink } from '@/context/SettingsContext';

const WHY_PARTNER = [
    'Custom pricing for bulk orders',
    'Dedicated account manager',
    'Custom packaging & branding',
    'Pan-India delivery',
    '30-day payment terms available',
    'Marketing support & POS materials',
    '100% vrat-friendly products',
    'In-house manufacturing — full quality control',
];

const WHAT_YOU_GET = [
    { icon: Clock, title: 'A quote within 24 hours', body: 'Custom pricing based on quantity and frequency.' },
    { icon: Users, title: 'One point of contact', body: 'A dedicated account manager from quote to delivery.' },
    { icon: Package, title: 'Your branding, our bake', body: 'Custom packaging and POS materials for your shelf.' },
    { icon: Truck, title: 'Shipped pan-India', body: 'Straight from our FSSAI-certified kitchen in Jaipur.' },
];

const INQUIRY_TYPES = [
    { value: 'retail', label: 'Retail Store Stocking' },
    { value: 'cafe', label: 'Café / Restaurant' },
    { value: 'gifting', label: 'Corporate Gifting' },
    { value: 'gym', label: 'Gym / Fitness Studio' },
    { value: 'distributor', label: 'Distributor / Wholesale' },
    { value: 'wellness', label: 'Wellness / Clinic' },
    { value: 'other', label: 'Other' },
];

type FieldKey = 'yourName' | 'phone' | 'email' | 'inquiryType';

const inputBase =
    'w-full rounded-xl border bg-white px-4 py-3.5 text-sm text-ink placeholder:text-ink/30 outline-none transition focus:ring-2 focus:ring-turmeric/30 focus:border-turmeric';

function Field({
    label,
    error,
    hint,
    children,
    className = '',
}: {
    label: string;
    error?: string;
    hint?: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <label className={`block ${className}`}>
            <span className="mb-1.5 block font-label text-[10px] tracking-[0.16em] uppercase text-ink/55">{label}</span>
            {children}
            {error ? (
                <span className="mt-1.5 block text-xs text-clay">{error}</span>
            ) : hint ? (
                <span className="mt-1.5 block text-xs text-ink/40">{hint}</span>
            ) : null}
        </label>
    );
}

function ContactRow({ icon: Icon, label, children }: { icon: typeof Phone; label: string; children: ReactNode }) {
    return (
        <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-turmeric/10 text-clay">
                <Icon size={14} />
            </span>
            <div className="min-w-0">
                <p className="font-label text-[10px] tracking-[0.16em] uppercase text-ink/45">{label}</p>
                <div className="mt-0.5 text-sm text-ink">{children}</div>
            </div>
        </div>
    );
}

export default function BulkOrderPage() {
    const BULK_ORDER_URL = apiUrl('/bulk-order');
    const { settings } = useSettings();

    const [formData, setFormData] = useState({
        companyName: '',
        yourName: '',
        phone: '',
        email: '',
        location: '',
        inquiryType: '',
        message: '',
    });
    const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldKey, string>>>({});
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const contactPhone = settings?.contact?.phone || '+91 94072 30914';
    const contactEmail = settings?.contact?.supportEmail || 'vrateezfoodspvtltd@gmail.com';
    const contactAddress = settings?.contact?.address || 'Jaipur, Rajasthan, India';
    const waNumber = settings?.contact?.whatsapp || '916375010189';
    const waHref = whatsappLink(waNumber, 'Hi Vrateez! I am interested in a bulk or special order.');
    const waFollowUpHref = whatsappLink(
        waNumber,
        'Hi Vrateez! I just sent a bulk order inquiry through the website and would like to discuss it.',
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const key = e.target.name as FieldKey;
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setFieldErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
    };

    const validate = (): boolean => {
        const errs: Partial<Record<FieldKey, string>> = {};
        if (!formData.yourName.trim()) errs.yourName = 'Please enter your name.';
        if (formData.phone.replace(/\D/g, '').length < 10) errs.phone = 'Enter a valid phone number.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) errs.email = 'Enter a valid email address.';
        if (!formData.inquiryType) errs.inquiryType = 'Please choose what this is about.';
        setFieldErrors(errs);
        const first = Object.keys(errs)[0];
        if (first) {
            document.getElementById(`field-${first}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setIsSubmitting(true);
        setSubmitError('');
        try {
            const response = await fetch(BULK_ORDER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = (await response.json()) as { message?: string };
            if (!response.ok) throw new Error(data.message || 'Unable to submit your inquiry right now.');
            setSubmitted(true);
            setFormData({ companyName: '', yourName: '', phone: '', email: '', location: '', inquiryType: '', message: '' });
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const borderFor = (key: FieldKey) => (fieldErrors[key] ? 'border-clay/60' : 'border-ink/12');

    return (
        <main className="min-h-screen bg-parchment">
            {/* Hero */}
            <section className="relative overflow-hidden bg-ink text-parchment">
                <div className="absolute inset-0">
                    <Image
                        src="/virteez/Assorted cookie box.jpeg"
                        alt=""
                        fill
                        priority
                        sizes="100vw"
                        className="object-cover opacity-25"
                    />
                    <div className="absolute inset-0 bg-linear-to-r from-ink via-ink/85 to-ink/40" />
                </div>
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.14]"
                    aria-hidden="true"
                    style={{ backgroundImage: 'radial-gradient(ellipse at 85% 30%, #E4A93D 0%, transparent 45%)' }}
                />
                <div className="relative max-w-6xl mx-auto px-4 md:px-8 pt-14 pb-24 md:pt-20 md:pb-28">
                    <p className="mb-3 font-label text-[10px] tracking-[0.24em] uppercase text-millet/80">Partner with Vrateez</p>
                    <h1 className="max-w-2xl font-display italic text-4xl md:text-6xl leading-[1.02]">
                        Bulk &amp; special orders, handled personally.
                    </h1>
                    <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-parchment/65">
                        Retail shelves, café counters, corporate gifting, gym fridges. Tell us what you need and we come back with
                        pricing within 24 hours.
                    </p>
                    <ul className="mt-7 flex flex-wrap gap-2">
                        {['Reply within 24 hours', 'Pan-India delivery', 'FSSAI-certified kitchen', 'Custom branding'].map((chip) => (
                            <li
                                key={chip}
                                className="rounded-full bg-parchment/10 px-3.5 py-1.5 text-xs font-medium text-parchment/85 ring-1 ring-parchment/15"
                            >
                                {chip}
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-12 md:-mt-14 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-6 lg:gap-8 items-start">
                    {/* Form */}
                    <section
                        className="overflow-hidden rounded-[22px] bg-white ring-1 ring-ink/[0.08] shadow-[0_30px_70px_-45px_rgba(36,31,22,0.5)]"
                        data-reveal
                    >
                        <header className="border-b border-ink/[0.06] px-5 py-5 md:px-7">
                            <p className="font-label text-[10px] tracking-[0.2em] uppercase text-clay">Send an inquiry</p>
                            <h2 className="mt-1 font-display text-2xl leading-tight text-ink">Tell us about your requirement</h2>
                            <p className="mt-1 text-sm text-ink/50">
                                Drop your details and we get back within 24 hours with custom pricing.
                            </p>
                        </header>

                        <div className="p-5 md:p-7">
                            {submitted ? (
                                <div className="py-6 text-center md:py-10">
                                    <span className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-basil text-parchment shadow-[0_0_0_10px_rgba(38,54,42,0.12)]">
                                        <CheckCircle2 size={28} />
                                    </span>
                                    <p className="font-label text-[10px] tracking-[0.2em] uppercase text-clay">Inquiry received</p>
                                    <h3 className="mt-2 font-display italic text-2xl leading-tight text-ink md:text-3xl">
                                        We will be in touch within 24 hours.
                                    </h3>
                                    <p className="mx-auto mt-3 max-w-sm text-sm text-ink/55">
                                        Custom pricing and details land in your inbox. Want to talk sooner? Follow up on WhatsApp and
                                        we will pick it up from there.
                                    </p>
                                    <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                                        {waFollowUpHref ? (
                                            <a
                                                href={waFollowUpHref}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="pressable inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-ink transition hover:bg-[#1ebe5d]"
                                            >
                                                <MessageCircle size={16} />
                                                Follow up on WhatsApp
                                            </a>
                                        ) : null}
                                        <button
                                            type="button"
                                            onClick={() => setSubmitted(false)}
                                            className="rounded-full px-6 py-3 text-sm font-semibold text-ink ring-1 ring-ink/15 transition hover:bg-ink/5"
                                        >
                                            Send another inquiry
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <Field label="Company name" hint="Optional">
                                            <input
                                                type="text"
                                                name="companyName"
                                                value={formData.companyName}
                                                onChange={handleChange}
                                                placeholder="Acme Corp"
                                                autoComplete="organization"
                                                className={`${inputBase} border-ink/12`}
                                            />
                                        </Field>
                                        <div id="field-yourName">
                                            <Field label="Your name" error={fieldErrors.yourName}>
                                                <input
                                                    type="text"
                                                    name="yourName"
                                                    value={formData.yourName}
                                                    onChange={handleChange}
                                                    placeholder="Your full name"
                                                    autoComplete="name"
                                                    required
                                                    aria-invalid={Boolean(fieldErrors.yourName)}
                                                    className={`${inputBase} ${borderFor('yourName')}`}
                                                />
                                            </Field>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div id="field-phone">
                                            <Field label="Phone" error={fieldErrors.phone}>
                                                <div className="relative">
                                                    <Phone size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/30" />
                                                    <input
                                                        type="tel"
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleChange}
                                                        placeholder="+91 99999 99999"
                                                        autoComplete="tel"
                                                        inputMode="tel"
                                                        required
                                                        aria-invalid={Boolean(fieldErrors.phone)}
                                                        className={`${inputBase} pl-11 ${borderFor('phone')}`}
                                                    />
                                                </div>
                                            </Field>
                                        </div>
                                        <div id="field-email">
                                            <Field label="Email" error={fieldErrors.email}>
                                                <div className="relative">
                                                    <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/30" />
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        placeholder="you@company.com"
                                                        autoComplete="email"
                                                        required
                                                        aria-invalid={Boolean(fieldErrors.email)}
                                                        className={`${inputBase} pl-11 ${borderFor('email')}`}
                                                    />
                                                </div>
                                            </Field>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <Field label="Location" hint="City and state help us plan delivery">
                                            <div className="relative">
                                                <MapPin size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/30" />
                                                <input
                                                    type="text"
                                                    name="location"
                                                    value={formData.location}
                                                    onChange={handleChange}
                                                    placeholder="City, State"
                                                    autoComplete="address-level2"
                                                    className={`${inputBase} pl-11 border-ink/12`}
                                                />
                                            </div>
                                        </Field>
                                        <div id="field-inquiryType">
                                            <Field label="This is about" error={fieldErrors.inquiryType}>
                                                <div className="relative">
                                                    <select
                                                        name="inquiryType"
                                                        value={formData.inquiryType}
                                                        onChange={handleChange}
                                                        required
                                                        aria-invalid={Boolean(fieldErrors.inquiryType)}
                                                        className={`${inputBase} appearance-none pr-10 ${borderFor('inquiryType')} ${
                                                            formData.inquiryType ? 'text-ink' : 'text-ink/40'
                                                        }`}
                                                    >
                                                        <option value="">Please select</option>
                                                        {INQUIRY_TYPES.map((t) => (
                                                            <option key={t.value} value={t.value}>
                                                                {t.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown
                                                        size={16}
                                                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink/40"
                                                    />
                                                </div>
                                            </Field>
                                        </div>
                                    </div>

                                    <Field label="Message" hint="Optional. Estimated quantity, preferred products, timelines.">
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            rows={4}
                                            placeholder="Tell us about your requirements, estimated quantity, preferred products..."
                                            className={`${inputBase} resize-none border-ink/12`}
                                        />
                                    </Field>

                                    {submitError ? (
                                        <div className="rounded-xl bg-clay/10 px-3.5 py-3 text-sm text-clay ring-1 ring-clay/20">{submitError}</div>
                                    ) : null}

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="pressable mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-turmeric px-7 py-3.5 text-sm font-semibold text-parchment shadow-lg shadow-turmeric/25 transition hover:bg-clay disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
                                        {isSubmitting ? 'Sending…' : 'Send inquiry'}
                                    </button>
                                    <p className="text-center text-[11px] text-ink/40">
                                        We only use these details to reply to your inquiry.
                                    </p>
                                </form>
                            )}
                        </div>
                    </section>

                    {/* Sidebar */}
                    <aside className="space-y-6 lg:sticky lg:top-28" data-reveal data-reveal-delay="120">
                        <div className="rounded-[22px] bg-ink p-6 text-parchment shadow-[0_30px_70px_-45px_rgba(36,31,22,0.6)]">
                            <p className="mb-4 font-label text-[10px] tracking-[0.2em] uppercase text-millet/80">What you get</p>
                            <ul className="space-y-4">
                                {WHAT_YOU_GET.map(({ icon: Icon, title, body }) => (
                                    <li key={title} className="flex gap-3">
                                        <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-parchment/10 text-millet ring-1 ring-parchment/10">
                                            <Icon size={15} />
                                        </span>
                                        <div>
                                            <p className="text-sm font-semibold leading-snug">{title}</p>
                                            <p className="mt-0.5 text-xs leading-relaxed text-parchment/55">{body}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="rounded-[22px] bg-white p-6 ring-1 ring-ink/[0.08]">
                            <p className="mb-1 font-label text-[10px] tracking-[0.2em] uppercase text-clay">Why partner with Vrateez</p>
                            <p className="font-display italic text-xl leading-tight text-ink">Pure ingredients, honest preparation.</p>
                            <ul className="mt-4 grid grid-cols-1 gap-2.5">
                                {WHY_PARTNER.map((item) => (
                                    <li key={item} className="flex items-start gap-2.5 text-sm text-ink/70">
                                        <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-basil/10 text-basil">
                                            <Check size={11} strokeWidth={3} />
                                        </span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="rounded-[22px] bg-white p-6 ring-1 ring-ink/[0.08]">
                            <p className="mb-4 font-label text-[10px] tracking-[0.2em] uppercase text-clay">Talk to us directly</p>
                            <div className="space-y-4">
                                <ContactRow icon={Phone} label="Phone">
                                    <a href={`tel:${contactPhone.replace(/[^\d+]/g, '')}`} className="font-medium transition hover:text-clay">
                                        {contactPhone}
                                    </a>
                                </ContactRow>
                                <ContactRow icon={Mail} label="Email">
                                    <a href={`mailto:${contactEmail}`} className="break-all font-medium transition hover:text-clay">
                                        {contactEmail}
                                    </a>
                                </ContactRow>
                                <ContactRow icon={MapPin} label="Address">
                                    <p className="text-ink/70">{contactAddress}</p>
                                </ContactRow>
                            </div>
                            {waHref ? (
                                <a
                                    href={waHref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="pressable mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-ink transition hover:bg-[#1ebe5d]"
                                >
                                    <MessageCircle size={16} />
                                    WhatsApp us
                                </a>
                            ) : null}
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}
