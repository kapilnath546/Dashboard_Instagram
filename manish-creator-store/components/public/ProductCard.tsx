import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import type { ProductWithCategory } from "@/lib/types/database";

interface ProductCardProps {
  product: ProductWithCategory;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const categoryColor = product.categories?.color || "#C75B33";
  const categoryName = product.categories?.name || "Recommendation";

  return (
    <div className="group flex flex-col justify-between h-full bg-transparent transition-transform duration-200">
      <div className="space-y-3">
        {/* Product image container with category pastel tint */}
        <Link
          href={`/products/${product.slug}`}
          className="relative aspect-square w-full rounded-2xl overflow-hidden flex items-center justify-center transition-all duration-300 group-hover:shadow-md block"
          style={{
            backgroundColor: `${categoryColor}15`,
          }}
        >
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.title}
              fill
              priority={priority}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <span className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-deep/50 bg-white/80 px-3.5 py-1.5 rounded-full backdrop-blur-xs">
              Product image
            </span>
          )}
        </Link>

        {/* Category label */}
        <div
          className="text-[11px] font-bold tracking-wider uppercase"
          style={{ color: categoryColor }}
        >
          {categoryName}
        </div>

        {/* Product Title */}
        <Link href={`/products/${product.slug}`} className="block group-hover:text-accent transition-colors">
          <h3 className="font-heading text-base sm:text-lg font-bold text-charcoal-deep leading-snug line-clamp-1">
            {product.title}
          </h3>
        </Link>

        {/* Short description */}
        <p className="text-xs sm:text-sm text-muted leading-relaxed line-clamp-2">
          {product.short_description || product.description || "One line on why Manish recommends it."}
        </p>

        {/* Optional Price Display */}
        {product.price !== null && product.price > 0 && (
          <div className="text-sm font-semibold text-charcoal-deep">
            {formatPrice(product.price)}
          </div>
        )}
      </div>

      {/* Outbound click button */}
      <div className="flex items-center gap-3 pt-3 mt-auto">
        <a
          href={`/go/${product.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2 rounded-full bg-charcoal hover:bg-charcoal-deep text-white text-xs font-semibold tracking-wide transition-all duration-150 hover:scale-[1.02] shadow-xs"
        >
          Shop now
        </a>
      </div>
    </div>
  );
}
