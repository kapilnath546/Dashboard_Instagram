# Manish. — Creator Affiliate Storefront

A high-performance, light-editorial creator affiliate storefront built for Manish ([@manishh_mk_](https://www.instagram.com/manishh_mk_/)).

## Tech Stack
- **Framework**: Next.js 16 (App Router with Turbopack, React 19)
- **Styling**: Tailwind CSS (Custom editorial palette: Cream `#F5F2EB`, Charcoal `#2D2D2D`, Accent `#C75B33`)
- **Typography**: Bricolage Grotesque (Headings) + Inter (Body)
- **Database & Auth**: Supabase (PostgreSQL, Auth, Storage) — strictly Free Tier
- **Security**: Strict RLS policies, `is_admin()` SECURITY DEFINER guard, zero service-role keys exposed, HMAC-SHA256 privacy-preserving click tracking

---

## 1. Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase Project API Settings (Settings > API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-or-anon-key

# Server-only secret salt for HMAC-SHA256 IP hashing (never exposed to browser)
# Generate via: node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
CLICK_SALT=your-random-32-byte-hex-string
```

> **Security Note**: This application uses **no service-role key**. All admin mutations execute using the authenticated user's session token and rely on Postgres RLS + `is_admin()`.

---

## 2. Database Setup

Run the migrations in your **Supabase Dashboard > SQL Editor**:

1. **Schema Migration (`supabase/migrations/001_init.sql`)**:
   - Creates `profiles`, `categories`, `products`, `admin_users`, and `product_clicks`.
   - Adds indexes, `updated_at` triggers, and `profiles_singleton` unique constraint.
   - Creates the `is_admin()` function (`SECURITY DEFINER`, `search_path = ''`).
   - Configures explicit `GRANT`s for `anon` and `authenticated` roles (compatible with auto-expose off).
   - Creates the `record_click()` RPC function (sanitizes inputs, checks published status, records click, returns affiliate URL).
   - Creates the `get_product_click_summary()` admin analytics function.
   - Sets up the `product-images` storage bucket (public read, admin-only write, max 2MB).

2. **Seed Data (`supabase/seed.sql`)**:
   - Seeds the 4 categories: *Grooming & Haircare*, *Men's Fashion*, *Fitness & Lifestyle*, and *Amazon Finds*.
   - Seeds the default creator profile row for Manish with bracketed placeholders for bio copy.

---

## 3. Creating & Whitelisting Your Admin User

1. In Supabase Dashboard, go to **Authentication > Users > Add user > Create user**.
2. Enter your admin email and password.
3. Copy the generated User UID (UUID).
4. Run this query in the **SQL Editor**:
   ```sql
   INSERT INTO public.admin_users (id, role)
   VALUES ('<PASTE-YOUR-AUTH-USER-UUID-HERE>', 'admin')
   ON CONFLICT (id) DO NOTHING;
   ```
5. You can now log in at `/auth/login` to access the full admin dashboard at `/admin`.

---

## 4. How to Deploy to Vercel

1. Push your repository to GitHub.
2. Go to [vercel.com](https://vercel.com) and click **Add New > Project**.
3. Import your repository and select the root directory (or `manish-creator-store`).
4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `CLICK_SALT`
5. Click **Deploy**.

---

## 5. Free Tier Keepalive Automation

Supabase pauses free projects after 7 days of inactivity. A GitHub Actions workflow is included at `.github/workflows/keepalive.yml`:
- Scheduled every 3 days at 06:00 UTC.
- Pings the Supabase REST health endpoint.
- To enable: Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to **GitHub Repository Settings > Secrets and variables > Actions**.

---

## 6. Pre-Launch Deployment Checklist

- [ ] Applied `supabase/migrations/001_init.sql` and `supabase/seed.sql` in Supabase SQL editor.
- [ ] Created admin user and whitelisted their UUID in `public.admin_users`.
- [ ] Generated `CLICK_SALT` and set it in `.env.local` and Vercel environment variables.
- [ ] Verified login at `/auth/login` and confirmed non-admin accounts cannot access `/admin`.
- [ ] Uploaded profile portrait and verified bio copy at `/admin/profile`.
- [ ] Added first batch of products with valid `https://` affiliate links and published them.
- [ ] Tested `/go/[slug]` click redirection (verifying 302 redirect and click count incrementing).
- [ ] Added repository secrets for `.github/workflows/keepalive.yml`.
