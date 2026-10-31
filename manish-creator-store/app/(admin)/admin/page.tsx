import { requireAdmin } from "@/lib/supabase/admin-auth";
import Link from "next/link";
import { MousePointerClick, Package, Plus, ArrowRight } from "lucide-react";


interface ProductClickSummary {
  product_id: string;
  title: string;
  slug: string;
  is_published: boolean;
  is_featured: boolean;
  total_clicks: number;
}

export default async function AdminOverviewPage() {
  const { supabase } = await requireAdmin();

  // Fetch per-product click counts via our admin-only RPC
  const { data: clickSummaryData, error: summaryError } = await supabase
    .rpc("get_product_click_summary");

  const clickSummary: ProductClickSummary[] = (clickSummaryData as ProductClickSummary[]) || [];

  // Total clicks across all products
  const totalClicks = clickSummary.reduce(
    (sum, item) => sum + Number(item.total_clicks || 0),
    0,
  );

  // Top 5 clicked products
  const top5 = clickSummary.slice(0, 5);

  // Product counts
  const totalProducts = clickSummary.length;
  const publishedCount = clickSummary.filter((p) => p.is_published).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-wider uppercase text-muted">
            Dashboard
          </p>
          <h1 className="font-heading text-3xl font-bold text-charcoal-deep">
            Overview
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

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Total Clicks */}
        <div className="bg-white border border-border rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Total Affiliate Clicks
            </span>
            <div className="p-2 bg-accent/10 rounded-lg text-accent">
              <MousePointerClick className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-4xl font-heading font-bold text-charcoal-deep">
              {totalClicks.toLocaleString()}
            </div>
            <p className="text-xs text-muted mt-1">All-time tracked clicks on /go/[slug]</p>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white border border-border rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Live Products
            </span>
            <div className="p-2 bg-charcoal/10 rounded-lg text-charcoal">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-4xl font-heading font-bold text-charcoal-deep">
              {publishedCount}
              <span className="text-lg font-normal text-muted ml-2">
                / {totalProducts} total
              </span>
            </div>
            <p className="text-xs text-muted mt-1">
              {totalProducts - publishedCount} draft(s) currently unlisted
            </p>
          </div>
        </div>
      </div>

      {/* Top 5 Products by Clicks */}
      <div className="bg-white border border-border rounded-xl p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="font-heading text-lg font-bold text-charcoal-deep">
              Top Products by Clicks
            </h2>
            <p className="text-xs text-muted">Most clicked affiliate links</p>
          </div>
          <Link
            href="/admin/products"
            className="text-xs font-medium text-charcoal hover:text-accent flex items-center gap-1 transition-colors"
          >
            View all products
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {summaryError && (
          <p className="text-sm text-red-500 py-4">
            Failed to load click statistics: {summaryError.message}
          </p>
        )}

        {top5.length === 0 ? (
          <div className="py-12 text-center text-muted text-sm">
            <MousePointerClick className="w-8 h-8 mx-auto mb-2 opacity-30 text-charcoal" />
            No clicks recorded yet. Add products and share your link!
          </div>
        ) : (
          <div className="space-y-4">
            {top5.map((item, idx) => {
              const percentage =
                totalClicks > 0
                  ? Math.round((Number(item.total_clicks) / totalClicks) * 100)
                  : 0;

              return (
                <div key={item.product_id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-bold text-muted w-5">
                        #{idx + 1}
                      </span>
                      <Link
                        href={`/admin/products/${item.product_id}/edit`}
                        className="font-medium text-charcoal-deep hover:text-accent truncate transition-colors"
                      >
                        {item.title}
                      </Link>
                      {!item.is_published && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 font-semibold uppercase">
                          Draft
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-muted">{percentage}%</span>
                      <span className="font-semibold text-charcoal-deep">
                        {Number(item.total_clicks).toLocaleString()} clicks
                      </span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-cream h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-accent h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(percentage, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
