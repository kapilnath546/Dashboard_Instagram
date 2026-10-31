-- =============================================================================
-- Migration: 001_init.sql
-- Creator Storefront Database Schema for Manish (@manishh_mk_)
-- =============================================================================

-- Ensure necessary extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. Profiles Table (Single-row store creator profile)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL DEFAULT 'Manish',
  handle text NOT NULL DEFAULT '@manishh_mk_',
  bio text,
  avatar_url text,
  secondary_photo_url text,
  instagram_url text,
  whatsapp_url text,
  youtube_url text,
  facebook_url text,
  email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enforce strictly at most one profile row in the database
CREATE UNIQUE INDEX IF NOT EXISTS profiles_singleton ON public.profiles ((true));

-- -----------------------------------------------------------------------------
-- 2. Categories Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  color text NOT NULL DEFAULT '#C75B33',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON public.categories (sort_order ASC);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories (slug);

-- -----------------------------------------------------------------------------
-- 3. Products Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  short_description text,
  description text,
  image_url text,
  affiliate_url text NOT NULL,
  price numeric(10, 2) DEFAULT NULL,
  currency text NOT NULL DEFAULT 'INR',
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  is_published boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT check_affiliate_url_https CHECK (affiliate_url ~ '^https://')
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products (slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category_id);
CREATE INDEX IF NOT EXISTS idx_products_published ON public.products (is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products (is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_sort_order ON public.products (sort_order ASC);

-- -----------------------------------------------------------------------------
-- 4. Admin Users Table (Whitelisted UIDs from auth.users)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'admin',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 5. Product Clicks Table (Outbound link click tracking)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  clicked_at timestamptz NOT NULL DEFAULT now(),
  ip_hash text,
  user_agent text,
  referrer text,
  country text
);

CREATE INDEX IF NOT EXISTS idx_product_clicks_product_id ON public.product_clicks (product_id);
CREATE INDEX IF NOT EXISTS idx_product_clicks_clicked_at ON public.product_clicks (clicked_at DESC);

-- -----------------------------------------------------------------------------
-- 6. Trigger for updated_at
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 7. is_admin() Function (SECURITY DEFINER, fully qualified, search_path = '')
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE id = auth.uid()
  );
$$;

-- -----------------------------------------------------------------------------
-- 8. Row Level Security (RLS)
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_clicks ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
CREATE POLICY "profiles_select_public"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
CREATE POLICY "profiles_admin_all"
  ON public.profiles FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Categories policies
DROP POLICY IF EXISTS "categories_select_public" ON public.categories;
CREATE POLICY "categories_select_public"
  ON public.categories FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "categories_admin_all" ON public.categories;
CREATE POLICY "categories_admin_all"
  ON public.categories FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Products policies: public reads published only; admin reads & writes all
DROP POLICY IF EXISTS "products_select_published" ON public.products;
CREATE POLICY "products_select_published"
  ON public.products FOR SELECT
  USING (is_published = true OR public.is_admin());

DROP POLICY IF EXISTS "products_admin_all" ON public.products;
CREATE POLICY "products_admin_all"
  ON public.products FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Product clicks policies: readable by admin only; no direct table insert/update/delete
DROP POLICY IF EXISTS "product_clicks_select_admin" ON public.product_clicks;
CREATE POLICY "product_clicks_select_admin"
  ON public.product_clicks FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Admin users policies: user can inspect own row; admin can inspect all
DROP POLICY IF EXISTS "admin_users_select_own" ON public.admin_users;
CREATE POLICY "admin_users_select_own"
  ON public.admin_users FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR public.is_admin());

-- -----------------------------------------------------------------------------
-- 9. Explicit GRANTs (Auto-expose is OFF)
-- -----------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- anon permissions: SELECT on categories, products, profiles only
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT ON public.categories TO anon;
GRANT SELECT ON public.products TO anon;

-- authenticated permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT SELECT ON public.product_clicks TO authenticated;
GRANT SELECT ON public.admin_users TO authenticated;

-- Revoke default public/anon access from sensitive tables
REVOKE ALL ON public.product_clicks FROM anon;
REVOKE ALL ON public.admin_users FROM anon;

-- -----------------------------------------------------------------------------
-- 10. record_click() Function (SECURITY DEFINER)
-- Truncates inputs to defend against oversized or malformed payloads
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.record_click(
  p_slug text,
  p_ip_hash text DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_referrer text DEFAULT NULL,
  p_country text DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_product_id uuid;
  v_affiliate_url text;
  v_slug text := left(p_slug, 200);
  v_ip_hash text := left(p_ip_hash, 128);
  v_user_agent text := left(p_user_agent, 300);
  v_referrer text := left(p_referrer, 300);
  v_country text := left(p_country, 8);
BEGIN
  -- Lookup only published products
  SELECT id, affiliate_url
  INTO v_product_id, v_affiliate_url
  FROM public.products
  WHERE slug = v_slug AND is_published = true;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Insert click record using elevated definer privileges
  INSERT INTO public.product_clicks (
    product_id,
    ip_hash,
    user_agent,
    referrer,
    country
  ) VALUES (
    v_product_id,
    v_ip_hash,
    v_user_agent,
    v_referrer,
    v_country
  );

  -- Return the exact affiliate URL for redirect
  RETURN v_affiliate_url;
END;
$$;

REVOKE ALL ON FUNCTION public.record_click(text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_click(text, text, text, text, text) TO anon, authenticated;

-- -----------------------------------------------------------------------------
-- 11. Per-product Click Summary Function (Admin only)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_product_click_summary()
RETURNS TABLE (
  product_id uuid,
  title text,
  slug text,
  is_published boolean,
  is_featured boolean,
  total_clicks bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT
    p.id AS product_id,
    p.title,
    p.slug,
    p.is_published,
    p.is_featured,
    COUNT(c.id)::bigint AS total_clicks
  FROM public.products p
  LEFT JOIN public.product_clicks c ON c.product_id = p.id
  GROUP BY p.id, p.title, p.slug, p.is_published, p.is_featured
  ORDER BY 6 DESC, p.created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_product_click_summary() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_product_click_summary() TO authenticated;

-- -----------------------------------------------------------------------------
-- 12. Storage Setup: product-images bucket & policies
-- -----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Storage RLS policies (Write actions require is_admin(); public bucket serves public reads directly)
DROP POLICY IF EXISTS "product_images_public_read" ON storage.objects;

DROP POLICY IF EXISTS "product_images_admin_insert" ON storage.objects;
CREATE POLICY "product_images_admin_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

DROP POLICY IF EXISTS "product_images_admin_update" ON storage.objects;
CREATE POLICY "product_images_admin_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-images' AND public.is_admin())
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

DROP POLICY IF EXISTS "product_images_admin_delete" ON storage.objects;
CREATE POLICY "product_images_admin_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images' AND public.is_admin());
