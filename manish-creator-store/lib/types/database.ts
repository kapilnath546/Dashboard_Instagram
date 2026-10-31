/* ─────────────────────────────────────────────────
 *  Database type definitions
 *  Matches the Supabase schema defined in the plan.
 * ───────────────────────────────────────────────── */

export interface Profile {
  id: string;
  full_name: string;
  handle: string;
  bio: string | null;
  avatar_url: string | null;
  secondary_photo_url: string | null;
  instagram_url: string | null;
  whatsapp_url: string | null;
  youtube_url: string | null;
  facebook_url: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  image_url: string | null;
  affiliate_url: string;
  price: number | null;
  currency: string;
  category_id: string | null;
  is_published: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/** Product with its category joined */
export interface ProductWithCategory extends Product {
  categories: Pick<Category, "id" | "name" | "slug" | "color"> | null;
}

export interface ProductClick {
  id: string;
  product_id: string;
  clicked_at: string;
  ip_hash: string | null;
  user_agent: string | null;
  referrer: string | null;
  country: string | null;
}

export interface AdminUser {
  id: string;
  role: string;
  created_at: string;
}

/** Shape returned by the record_click() RPC */
export interface RecordClickResult {
  affiliate_url: string;
}
