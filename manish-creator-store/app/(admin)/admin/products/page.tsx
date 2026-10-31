import { requireAdmin } from "@/lib/supabase/admin-auth";
import Link from "next/link";
import { Plus } from "lucide-react";
import { ProductTable } from "@/components/admin/ProductTable";
import type { ProductWithCategory } from "@/lib/types/database";


export default async function AdminProductsPage() {
  const { supabase } = await requireAdmin();

  // Fetch all products ordered by sort_order
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
    .order("sort_order", { ascending: true });

  // Fetch click counts per product via our admin RPC
  const { data: clickSummaryData } = await supabase.rpc("get_product_click_summary");

  const clickMap = new Map<string, number>();
  if (Array.isArray(clickSummaryData)) {
    for (const item of clickSummaryData) {
      clickMap.set(item.product_id, Number(item.total_clicks || 0));
    }
  }

  const products = ((productsData as unknown as ProductWithCategory[]) || []).map((p) => ({
    ...p,
    clicks_count: clickMap.get(p.id) ?? 0,
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-wider uppercase text-muted">
            Catalog Management
          </p>
          <h1 className="font-heading text-3xl font-bold text-charcoal-deep">
            Products
          </h1>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent hover:bg-accent-hover text-white font-medium text-sm transition-colors shadow-sm w-fit"
        >
          <Plus className="w-4 h-4" />
          Add product
        </Link>
      </div>

      <ProductTable products={products} />
    </div>
  );
}
