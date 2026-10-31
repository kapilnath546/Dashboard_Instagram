"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Star,
  CheckCircle2,
  CircleDashed,
  ExternalLink,
  Plus,
  Package,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import {
  deleteProductAction,
  reorderProductAction,
  toggleProductFeaturedAction,
  toggleProductPublishedAction,
} from "@/lib/actions/admin-actions";
import { formatPrice } from "@/lib/utils";
import type { ProductWithCategory } from "@/lib/types/database";

interface ProductRow extends ProductWithCategory {
  clicks_count?: number;
}

interface ProductTableProps {
  products: ProductRow[];
}

export function ProductTable({ products: initialProducts }: ProductTableProps) {
  const { success, error: toastError } = useToast();
  const [isPending, startTransition] = useTransition();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleTogglePublish = (id: string, currentState: boolean) => {
    startTransition(async () => {
      const res = await toggleProductPublishedAction(id, currentState);
      if (res.error) {
        toastError(res.error);
      } else {
        success(res.is_published ? "Product published!" : "Product moved to drafts.");
      }
    });
  };

  const handleToggleFeatured = (id: string, currentState: boolean) => {
    startTransition(async () => {
      const res = await toggleProductFeaturedAction(id, currentState);
      if (res.error) {
        toastError(res.error);
      } else {
        success(res.is_featured ? "Added to Featured finds!" : "Removed from Featured.");
      }
    });
  };

  const handleReorder = (id: string, direction: "up" | "down") => {
    startTransition(async () => {
      const res = await reorderProductAction(id, direction);
      if (res.error) {
        toastError(res.error);
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const res = await deleteProductAction(id);
      if (res.error) {
        toastError(res.error);
      } else {
        success("Product deleted successfully.");
        setDeleteConfirmId(null);
      }
    });
  };

  if (initialProducts.length === 0) {
    return (
      <div className="bg-white border border-border rounded-2xl p-12 text-center space-y-4 shadow-sm">
        <div className="p-4 bg-cream rounded-full w-16 h-16 mx-auto flex items-center justify-center text-charcoal">
          <Package className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="font-heading text-lg font-bold text-charcoal-deep">
            No products added yet
          </h3>
          <p className="text-sm text-muted max-w-sm mx-auto">
            Add your first recommended product with affiliate link to start curating your store.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-accent hover:bg-accent-hover text-white font-medium text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add your first product
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#FAF8F5] text-xs font-semibold text-charcoal uppercase tracking-wider border-b border-border select-none">
            <tr>
              <th className="py-3.5 px-4 w-12 text-center">Order</th>
              <th className="py-3.5 px-4">Product</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4 text-center">Clicks</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 text-center">Featured</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/70">
            {initialProducts.map((p, idx) => (
              <tr
                key={p.id}
                className="hover:bg-cream/30 transition-colors group"
              >
                {/* Reorder Buttons */}
                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                  <div className="flex flex-col items-center gap-0.5">
                    <button
                      type="button"
                      disabled={isPending || idx === 0}
                      onClick={() => handleReorder(p.id, "up")}
                      className="p-1 rounded text-neutral-400 hover:text-charcoal hover:bg-neutral-100 disabled:opacity-20 transition-colors"
                      title="Move up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={isPending || idx === initialProducts.length - 1}
                      onClick={() => handleReorder(p.id, "down")}
                      className="p-1 rounded text-neutral-400 hover:text-charcoal hover:bg-neutral-100 disabled:opacity-20 transition-colors"
                      title="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>

                {/* Product Thumbnail & Title */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3.5 min-w-[220px]">
                    <div
                      className="relative w-12 h-12 rounded-lg shrink-0 overflow-hidden border border-border flex items-center justify-center"
                      style={{
                        backgroundColor: p.categories?.color
                          ? `${p.categories.color}20`
                          : "#F3E8E0",
                      }}
                    >
                      {p.image_url ? (
                        <Image
                          src={p.image_url}
                          alt={p.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-[10px] uppercase font-bold text-charcoal/40">
                          IMG
                        </span>
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <div className="font-heading font-semibold text-charcoal-deep hover:text-accent transition-colors line-clamp-1">
                        <Link href={`/admin/products/${p.id}/edit`}>{p.title}</Link>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted">
                        <span>/go/{p.slug}</span>
                        {p.price !== null && p.price > 0 && (
                          <>
                            <span>•</span>
                            <span className="font-medium text-charcoal-deep">
                              {formatPrice(p.price)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  {p.categories ? (
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: `${p.categories.color}15`,
                        color: p.categories.color || "#C75B33",
                      }}
                    >
                      {p.categories.name}
                    </span>
                  ) : (
                    <span className="text-xs text-muted">Uncategorized</span>
                  )}
                </td>

                {/* Clicks */}
                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                  <span className="font-semibold text-charcoal-deep">
                    {p.clicks_count?.toLocaleString() || 0}
                  </span>
                </td>

                {/* Status: Published vs Draft */}
                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(p.id, p.is_published)}
                    disabled={isPending}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      p.is_published
                        ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                        : "bg-neutral-100 text-neutral-600 border border-neutral-200 hover:bg-neutral-200"
                    }`}
                  >
                    {p.is_published ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                        Published
                      </>
                    ) : (
                      <>
                        <CircleDashed className="w-3.5 h-3.5 text-neutral-400" />
                        Draft
                      </>
                    )}
                  </button>
                </td>

                {/* Featured */}
                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => handleToggleFeatured(p.id, p.is_featured)}
                    disabled={isPending}
                    className={`p-1.5 rounded-full transition-colors ${
                      p.is_featured
                        ? "text-amber-500 bg-amber-50 hover:bg-amber-100"
                        : "text-neutral-300 hover:text-amber-400 hover:bg-neutral-100"
                    }`}
                    title={p.is_featured ? "Featured on Home" : "Make Featured"}
                  >
                    <Star
                      className={`w-4 h-4 ${p.is_featured ? "fill-amber-500" : ""}`}
                    />
                  </button>
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/products/${p.slug}`}
                      target="_blank"
                      className="p-2 text-neutral-400 hover:text-charcoal hover:bg-neutral-100 rounded-lg transition-colors"
                      title="View public page"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      className="p-2 text-neutral-400 hover:text-charcoal hover:bg-neutral-100 rounded-lg transition-colors"
                      title="Edit product"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(p.id)}
                      className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-border space-y-4">
            <h3 className="font-heading text-lg font-bold text-charcoal-deep">
              Delete this product?
            </h3>
            <p className="text-sm text-body">
              This action cannot be undone. All click tracking records for this product will also be permanently removed.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-full border border-border text-sm font-medium hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={isPending}
                className="px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors shadow-sm"
              >
                {isPending ? "Deleting..." : "Delete product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
