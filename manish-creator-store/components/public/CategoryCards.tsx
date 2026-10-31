import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Category } from "@/lib/types/database";

interface CategoryCardsProps {
  categories: Category[];
}

export function CategoryCards({ categories }: CategoryCardsProps) {
  if (categories.length === 0) return null;

  return (
    <section className="space-y-6">
      <div className="flex items-baseline justify-between border-b border-border/80 pb-4">
        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-charcoal-deep">
          Browse by category
        </h2>
        <Link
          href="/products"
          className="text-xs sm:text-sm font-medium text-body hover:text-accent transition-colors flex items-center gap-1 group"
        >
          See everything
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {categories.map((cat, index) => {
          const num = String(index + 1).padStart(2, "0");
          return (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group bg-white border border-border hover:border-accent/60 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[140px] sm:min-h-[170px]"
            >
              <div className="font-mono text-sm sm:text-base font-bold text-accent">
                {num}
              </div>
              <div className="space-y-1 mt-4">
                <h3 className="font-heading text-base sm:text-lg font-bold text-charcoal-deep group-hover:text-accent transition-colors leading-tight">
                  {cat.name}
                </h3>
                {cat.description && (
                  <p className="text-xs text-muted line-clamp-1 hidden sm:block">
                    {cat.description}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
