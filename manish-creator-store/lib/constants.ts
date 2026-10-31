/* ─────────────────────────────────────────────────
 *  Site-wide constants
 * ───────────────────────────────────────────────── */

export const SITE_NAME = "Manish.";
export const SITE_TAGLINE = "Creator · Curated Finds";
export const SITE_DESCRIPTION =
  "Grooming, fashion, fitness and everyday finds from my Instagram, with a direct link to buy each one.";

export const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/manishh_mk_/",
  whatsapp: "", // filled from profile DB
  youtube: "https://www.youtube.com/@manishh_mk",
  facebook: "https://www.facebook.com/share/1CCdVhvnkv/?mibextid=wwXIfr",
} as const;

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "My Finds" },
  { href: "/about", label: "About" },
] as const;

export const ADMIN_NAV_LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/profile", label: "Profile & About" },
] as const;


/** Accepted image types for product uploads */
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

/** Default category colours (mapped by slug for convenience) */
export const CATEGORY_COLORS: Record<string, string> = {
  "grooming-haircare": "hsl(20 43% 92%)",
  "mens-fashion": "hsl(260 43% 92%)",
  "fitness-lifestyle": "hsl(140 43% 92%)",
  "amazon-finds": "hsl(150 33% 91%)",
};
