import Script from "next/script";
import { GTM_ID, GA_ID } from "@/lib/analytics";

/**
 * Loads GTM/GA4 only when an ID is configured. For UK PECR/GDPR compliance,
 * gate this behind cookie consent in production (e.g. Consent Mode default
 * "denied" until the user accepts). Left ungated here with no ID set, so the
 * site ships analytics-ready but silent until Elixa provides a container.
 */
export function Analytics() {
  if (!GTM_ID && !GA_ID) return null;
  return (
    <>
      {GTM_ID && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>
      )}
      {GA_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}',{anonymize_ip:true});`}
          </Script>
        </>
      )}
    </>
  );
}
