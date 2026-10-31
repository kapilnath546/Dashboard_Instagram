import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ProductCatalog } from "@/components/public/ProductCatalog";
import type { Category, ProductWithCategory } from "@/lib/types/database";

export const metadata: Metadata = {
  title: "My Finds — Everything I've Recommended",
  description:
    "Browse all grooming, fashion, fitness, and Amazon finds curated by Manish, with direct purchase links.",
};

interface ProductsPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { category } = await searchParams;
  const supabase = await createClient();

  // 1. Fetch all categories
  const { data: categoriesData } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  const categories = (categoriesData as Category[]) || [];

  // 2. Fetch all published products with category details
  const { data: productsData } = await supabase
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
    .order("sort_order", { ascending: true });

  const products = (productsData as unknown as ProductWithCategory[]) || [];

  return (
    <div className="space-y-10 py-6 sm:py-10 animate-in fade-in duration-200">
      {/* Header section matching Screenshot 3 */}
      <div className="space-y-3">
        <span className="text-xs font-bold tracking-widest uppercase text-muted">
          My Finds
        </span>
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-charcoal-deep tracking-tight">
          Everything I&apos;ve recommended.
        </h1>
        <p className="text-sm sm:text-base text-body max-w-2xl leading-relaxed">
          Each product links straight to the official store with a direct link to buy.
        </p>
      </div>

      {/* Catalog with live category filtering & search */}
      <ProductCatalog
        products={products}
        categories={categories}
        initialCategory={category || "all"}
      />
    </div>
  );
}
