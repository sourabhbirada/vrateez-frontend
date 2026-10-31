'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { activityTracker } from '@/lib/activityTracker';
import { GA_MEASUREMENT_ID, META_PIXEL_ID, trackPageView } from '@/lib/analytics';

/**
 * Loads GA4 and Meta Pixel only after the visitor accepts cookies.
 * Set NEXT_PUBLIC_GA_MEASUREMENT_ID (G-XXXX) and/or NEXT_PUBLIC_META_PIXEL_ID in the env.
 */
export default function Analytics() {
  const pathname = usePathname();
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    setConsented(activityTracker.getCookieConsent() === true);
    const onAccept = () => setConsented(true);
    window.addEventListener('vrateez:consent-accepted', onAccept);
    return () => window.removeEventListener('vrateez:consent-accepted', onAccept);
  }, []);

  useEffect(() => {
    if (!consented || !pathname) return;
    trackPageView(pathname);
  }, [consented, pathname]);

  if (!consented || (!GA_MEASUREMENT_ID && !META_PIXEL_ID)) return null;

  return (
    <>
      {GA_MEASUREMENT_ID ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });`}
          </Script>
        </>
      ) : null}
      {META_PIXEL_ID ? (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');`}
        </Script>
      ) : null}
    </>
  );
}
