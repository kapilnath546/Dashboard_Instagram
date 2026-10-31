import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ExternalLink, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/public/ProductCard";
import { formatPrice } from "@/lib/utils";
import type { ProductWithCategory } from "@/lib/types/database";


interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("title, short_description, description, image_url")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  const desc =
    product.short_description ||
    product.description ||
    "Curated recommendation by Manish.";

  return {
    title: product.title,
    description: desc,
    openGraph: {
      title: `${product.title} | Manish.`,
      description: desc,
      images: product.image_url ? [{ url: product.image_url }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch product with category
  const { data: productData, error } = await supabase
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
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error || !productData) {
    notFound();
  }

  const product = productData as unknown as ProductWithCategory;
  const categoryColor = product.categories?.color || "#C75B33";
  const categoryName = product.categories?.name || "Recommendation";

  // Fetch up to 3 related products in the same category
  let relatedProducts: ProductWithCategory[] = [];
  if (product.category_id) {
    const { data: relatedData } = await supabase
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
      .eq("category_id", product.category_id)
      .eq("is_published", true)
      .neq("id", product.id)
      .limit(3);

    relatedProducts = (relatedData as unknown as ProductWithCategory[]) || [];
  }

  return (
    <div className="space-y-12 py-6 sm:py-10 animate-in fade-in duration-200">
      {/* Breadcrumb row */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted flex-wrap">
        <Link href="/" className="hover:text-charcoal-deep transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/products" className="hover:text-charcoal-deep transition-colors">
          My Finds
        </Link>
        {product.categories && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link
              href={`/products?category=${product.categories.slug}`}
              className="hover:text-charcoal-deep transition-colors"
            >
              {product.categories.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-charcoal-deep font-medium truncate max-w-[200px]">
          {product.title}
        </span>
      </nav>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-14 items-start">
        {/* Left: Product Image */}
        <div className="md:col-span-6 lg:col-span-6">
          <div
            className="relative aspect-square w-full rounded-3xl overflow-hidden border border-border shadow-sm flex items-center justify-center"
            style={{
              backgroundColor: `${categoryColor}15`,
            }}
          >
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 550px"
                className="object-cover"
              />
            ) : (
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal/40 bg-white/80 px-4 py-2 rounded-full backdrop-blur-xs">
                Product Image
              </span>
            )}
          </div>
        </div>

        {/* Right: Details & Purchase CTA */}
        <div className="md:col-span-6 lg:col-span-6 space-y-6">
          <div className="space-y-2.5">
            <span
              className="text-xs font-bold tracking-widest uppercase inline-block"
              style={{ color: categoryColor }}
            >
              {categoryName}
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-charcoal-deep leading-tight">
              {product.title}
            </h1>
            {product.price !== null && product.price > 0 && (
              <div className="text-2xl font-bold font-heading text-charcoal-deep pt-1">
                {formatPrice(product.price)}
              </div>
            )}
          </div>

          {/* Short recommendation quote */}
          {product.short_description && (
            <div className="p-4 rounded-xl bg-white border border-border/80 text-sm text-charcoal-deep leading-relaxed font-medium">
              &ldquo;{product.short_description}&rdquo;
            </div>
          )}

          {/* Full description */}
          {product.description && (
            <div className="space-y-2 text-sm text-body leading-relaxed border-t border-border/70 pt-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted">
                About this find
              </h2>
              <p className="whitespace-pre-line">{product.description}</p>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="pt-2 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={`/go/${product.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-accent hover:bg-accent-hover text-white font-semibold text-sm transition-all duration-150 shadow-sm hover:scale-[1.02]"
              >
                Shop now
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted pt-1">
              <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
              <span>Direct link straight to the verified seller website.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products in this category */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6 pt-10 border-t border-border">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-charcoal-deep">
              More in {categoryName}
            </h2>
            <Link
              href={`/products?category=${product.categories?.slug}`}
              className="text-xs sm:text-sm font-semibold text-charcoal-deep hover:text-accent transition-colors"
            >
              View all
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
