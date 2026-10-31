"use client";

import { useState, useMemo } from "react";
import { Search, X, PackageOpen } from "lucide-react";
import { ProductCard } from "@/components/public/ProductCard";
import { cn } from "@/lib/utils";
import type { Category, ProductWithCategory } from "@/lib/types/database";

interface ProductCatalogProps {
  products: ProductWithCategory[];
  categories: Category[];
  initialCategory?: string;
}

export function ProductCatalog({
  products,
  categories,
  initialCategory = "all",
}: ProductCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filter products by category and search term
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category check
      const matchesCategory =
        selectedCategory === "all" ||
        product.categories?.slug === selectedCategory;

      // Search check
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        product.title.toLowerCase().includes(query) ||
        (product.short_description &&
          product.short_description.toLowerCase().includes(query)) ||
        (product.categories?.name &&
          product.categories.name.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Filters & Search Row matching Screenshot 3 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none select-none">
          {/* "All" Pill */}
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 shadow-2xs",
              selectedCategory === "all"
                ? "bg-charcoal text-white shadow-xs"
                : "bg-white border border-border text-charcoal-deep hover:border-charcoal/40",
            )}
          >
            All
          </button>

          {/* Dynamic Categories */}
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.slug)}
                className={cn(
                  "px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 shadow-2xs",
                  isSelected
                    ? "bg-charcoal text-white shadow-xs"
                    : "bg-white border border-border text-charcoal-deep hover:border-charcoal/40",
                )}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Search Bar Input */}
        <div className="relative w-full lg:w-72 shrink-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products"
            className="w-full pl-10 pr-9 py-2 rounded-full border border-border bg-white text-charcoal-deep placeholder:text-muted text-xs focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-muted hover:text-charcoal-deep"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl p-16 text-center space-y-3 shadow-xs">
          <div className="p-4 bg-cream rounded-full w-14 h-14 mx-auto flex items-center justify-center text-charcoal/60">
            <PackageOpen className="w-7 h-7" />
          </div>
          <h3 className="font-heading text-lg font-bold text-charcoal-deep">
            No products found
          </h3>
          <p className="text-sm text-muted max-w-sm mx-auto">
            {searchQuery
              ? `No recommendations match "${searchQuery}". Try a different keyword.`
              : "No products in this category yet. Check back soon!"}
          </p>
          {(searchQuery || selectedCategory !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="px-5 py-2 rounded-full border border-border bg-cream hover:bg-white text-xs font-semibold text-charcoal-deep transition-colors mt-2"
            >
              Reset filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
          {filteredProducts.map((product, idx) => (
            <ProductCard
              key={product.id}
              product={product}
              priority={idx < 4}
            />
          ))}
        </div>
      )}
    </div>
  );
}
