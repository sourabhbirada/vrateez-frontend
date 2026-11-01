"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { activityTracker } from "@/lib/activityTracker";

export default function CookieConsent() {
	const [showBanner, setShowBanner] = useState(false);

	useEffect(() => {
		// Check if user has already made a choice
		const consent = activityTracker.getCookieConsent();
		if (consent === null) {
			// Show banner after a short delay
			const timer = setTimeout(() => {
				setShowBanner(true);
			}, 1000);
			return () => clearTimeout(timer);
		}
	}, []);

	const handleAccept = () => {
		activityTracker.acceptCookies();
		window.dispatchEvent(new Event('vrateez:consent-accepted'));
		setShowBanner(false);
	};

	const handleReject = () => {
		activityTracker.rejectCookies();
		setShowBanner(false);
	};

	if (!showBanner) return null;

	return (
		<div
			role="dialog"
			aria-live="polite"
			aria-labelledby="cookie-consent-title"
			className="fixed bottom-[4.75rem] left-4 right-4 z-50 rounded-[22px] bg-parchment p-5 text-ink ring-1 ring-ink/[0.08] shadow-[0_24px_50px_-24px_rgba(36,31,22,0.55)] animate-slideUp sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-sm"
		>
			<p className="font-label text-[10px] tracking-[0.22em] uppercase text-clay">Cookies</p>
			<h3 id="cookie-consent-title" className="mt-1.5 font-display italic text-xl leading-tight text-ink">
				A small note on cookies.
			</h3>
			<p className="mt-2 text-[13px] leading-relaxed text-ink/60">
				We use cookies to keep your cart, understand what people browse and make the shop better. Accept to help us,
				or reject and only the essentials stay.{" "}
				<Link href="/privacy-policy" className="font-semibold text-ink/70 underline decoration-ink/20 underline-offset-4 transition hover:text-ink">
					Read our privacy policy
				</Link>
			</p>

			<div className="mt-4 flex items-center gap-2">
				<button
					type="button"
					onClick={handleReject}
					className="flex-1 rounded-full px-4 py-2.5 text-xs font-semibold text-ink ring-1 ring-ink/15 transition hover:bg-ink/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-turmeric/40"
				>
					Reject
				</button>
				<button
					type="button"
					onClick={handleAccept}
					className="pressable flex-1 rounded-full bg-turmeric px-4 py-2.5 text-xs font-semibold text-parchment shadow-lg shadow-turmeric/25 transition hover:bg-clay focus:outline-none focus-visible:ring-2 focus-visible:ring-turmeric/40"
				>
					Accept
				</button>
			</div>
		</div>
	);
}
