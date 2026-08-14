/** @type {import('next').NextConfig} */
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
};

export default nextConfig;
