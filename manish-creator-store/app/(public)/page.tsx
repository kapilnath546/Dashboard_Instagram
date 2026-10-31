import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/data/profile";
import { HeroSection } from "@/components/public/HeroSection";
import { CategoryCards } from "@/components/public/CategoryCards";
import { ProductCard } from "@/components/public/ProductCard";
import { AboutSnippet } from "@/components/public/AboutSnippet";
import type { Category, ProductWithCategory } from "@/lib/types/database";


export default async function HomePage() {
  const supabase = await createClient();
  const profile = await getProfile();

  // 1. Fetch categories
  const { data: categoriesData } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  const categories = (categoriesData as Category[]) || [];

  // 2. Fetch featured published products (fallback to latest published if none featured)
  let { data: featuredData } = await supabase
    .from("products")
    .select(
      `
      *,
      categories (
        id,
        name,
        slug,
        color
      )
    `,
    )
    .eq("is_published", true)
    .eq("is_featured", true)
    .order("sort_order", { ascending: true })
    .limit(4);

  // Fallback to latest published if no products are marked featured yet
  if (!featuredData || featuredData.length === 0) {
    const { data: fallbackData } = await supabase
      .from("products")
      .select(
        `
        *,
        categories (
          id,
          name,
          slug,
          color
        )
      `,
      )
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .limit(4);

    featuredData = fallbackData;
  }

  const featuredProducts = (featuredData as unknown as ProductWithCategory[]) || [];

  return (
    <div className="space-y-16 sm:space-y-24 py-4 animate-in fade-in duration-200">
      {/* 1. Hero Section */}
      <HeroSection profile={profile} />

      {/* 2. Browse by Category */}
      <CategoryCards categories={categories} />

      {/* 3. Featured Products / Latest finds from Instagram */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/80 pb-4">
          <div className="space-y-1">
            <span className="text-xs font-bold tracking-widest uppercase text-muted">
              Featured
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-charcoal-deep">
              Latest finds from Instagram
            </h2>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-border bg-white hover:bg-neutral-50 text-charcoal-deep font-semibold text-xs sm:text-sm transition-all duration-150 w-fit"
          >
            View all products
            <ArrowRight className="w-3.5 h-3.5 text-accent" />
          </Link>
        </div>

        {featuredProducts.length === 0 ? (
          <div className="bg-white border border-border rounded-2xl p-12 text-center space-y-3">
            <div className="p-3.5 bg-cream rounded-full w-12 h-12 mx-auto flex items-center justify-center text-accent">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-lg font-bold text-charcoal-deep">
              New finds coming soon
            </h3>
            <p className="text-sm text-muted max-w-md mx-auto">
              I am currently testing and curating new recommendations. Check back soon or follow along on Instagram!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 4. About Snippet */}
      <AboutSnippet profile={profile} />
    </div>
  );
}
