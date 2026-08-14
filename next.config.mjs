/** @type {import('next').NextConfig} */

// Set NEXT_PUBLIC_BASE_PATH (e.g. "/Elixa-Website-") when hosting under a
// sub-path such as a GitHub Pages project site. Empty for root-domain hosts
// (Vercel/Netlify/Cloudflare) and local dev.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig = {
  // Static export → deployable to any static host (GitHub Pages, Netlify,
  // Cloudflare Pages, S3) with excellent Core Web Vitals and no server needed.
  output: "export",
  images: {
    // Required for static export; we ship pre-optimised responsive assets.
    unoptimized: true,
  },
  trailingSlash: true,
  reactStrictMode: true,
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
};

export default nextConfig;
