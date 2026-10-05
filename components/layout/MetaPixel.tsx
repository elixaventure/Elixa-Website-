"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { site } from "@/content/site";
import { getConsent, onConsentChange } from "@/lib/consent";

/**
 * The Meta pixel, loaded only after the visitor has said yes.
 *
 * Deliberately not the snippet Meta hands out. That one runs on page load,
 * which under UK PECR is the thing you are not allowed to do — consent has
 * to come first, and "first" means before the script is fetched, not before
 * it reports. So the <script> is simply not rendered until consent is
 * granted, and Next's Script component takes it from there.
 *
 * The <noscript> tracking image from Meta's snippet is left out on purpose.
 * It fires the moment the HTML parses, with no way for JavaScript to hold it
 * back, so including it would reintroduce exactly the problem this component
 * exists to avoid — and the only visitors it reaches are ones with
 * JavaScript off, who see almost nothing of this site anyway.
 */
export function MetaPixel() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    setAllowed(getConsent() === "granted");
    return onConsentChange((s) => setAllowed(s === "granted"));
  }, []);

  if (!site.metaPixelId || !allowed) return null;

  return (
    <Script id="meta-pixel" strategy="afterInteractive">
      {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${site.metaPixelId}');
fbq('track','PageView');`}
    </Script>
  );
}
