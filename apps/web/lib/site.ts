// Canonical site URL — used for sitemap/robots (need absolute URLs) and
// metadataBase (so Open Graph/Twitter card images resolve correctly).
// Defaults to the current Vercel production URL; set NEXT_PUBLIC_SITE_URL
// once a custom domain exists so all of this points at the real domain
// instead of the vercel.app subdomain.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://dream-work-abroad-web.vercel.app";
