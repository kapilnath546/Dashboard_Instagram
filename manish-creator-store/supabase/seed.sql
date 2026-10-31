-- =============================================================================
-- Seed Data: seed.sql
-- Run after 001_init.sql is applied.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Default Categories (Matches design: 01, 02, 03, 04)
-- -----------------------------------------------------------------------------
INSERT INTO public.categories (name, slug, description, color, sort_order)
VALUES
  (
    'Grooming & Haircare',
    'grooming-haircare',
    'Dryers, trimmers, personal care',
    '#C75B33',
    1
  ),
  (
    'Men''s Fashion',
    'mens-fashion',
    'T-shirts, clothing, accessories',
    '#7B5EA7',
    2
  ),
  (
    'Fitness & Lifestyle',
    'fitness-lifestyle',
    'Gymwear and workout gear',
    '#3B8A6E',
    3
  ),
  (
    'Amazon Finds',
    'amazon-finds',
    'Useful gadgets, everyday picks',
    '#2E7D7A',
    4
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  color = EXCLUDED.color,
  sort_order = EXCLUDED.sort_order;

-- -----------------------------------------------------------------------------
-- 2. Store Creator Profile (Single-row with bracketed placeholders)
-- -----------------------------------------------------------------------------
INSERT INTO public.profiles (
  full_name,
  handle,
  bio,
  avatar_url,
  secondary_photo_url,
  instagram_url,
  whatsapp_url,
  youtube_url,
  email
)
VALUES (
  'Manish',
  '@manishh_mk_',
  '[Two or three sentences in Manish''s own words: who he is, what he posts about and why people can trust his picks.]

[A second short paragraph: how he chooses products and how often he posts new finds.]',
  NULL,
  NULL,
  'https://www.instagram.com/manishh_mk_/',
  NULL,
  NULL,
  NULL
)
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- 3. Admin User Whitelist Instruction (MANUAL STEP)
-- -----------------------------------------------------------------------------
-- 1. In your Supabase Dashboard, go to Authentication > Users > Add user > Create user.
-- 2. Provide your admin email and password.
-- 3. Copy the created User's UUID.
-- 4. Paste the UUID into the statement below and run it in the SQL Editor:
--
-- INSERT INTO public.admin_users (id, role)
-- VALUES ('<PASTE-YOUR-AUTH-USER-UUID-HERE>', 'admin')
-- ON CONFLICT (id) DO NOTHING;
