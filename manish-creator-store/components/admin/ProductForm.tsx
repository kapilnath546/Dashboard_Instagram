"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Upload, X, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import {
  createProductAction,
  updateProductAction,
  uploadImageAction,
} from "@/lib/actions/admin-actions";
import { formatPrice, isValidAffiliateUrl } from "@/lib/utils";
import type { Category, Product } from "@/lib/types/database";

interface ProductFormProps {
  categories: Category[];
  initialData?: Product | null;
}

export function ProductForm({ categories, initialData }: ProductFormProps) {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [isPending, startTransition] = useTransition();

  // Form State
  const [title, setTitle] = useState(initialData?.title || "");
  const [categoryId, setCategoryId] = useState(
    initialData?.category_id || categories[0]?.id || "",
  );
  const [price, setPrice] = useState<string>(
    initialData?.price !== null && initialData?.price !== undefined
      ? String(initialData.price)
      : "",
  );
  const [shortDescription, setShortDescription] = useState(
    initialData?.short_description || "",
  );
  const [description, setDescription] = useState(initialData?.description || "");
  const [affiliateUrl, setAffiliateUrl] = useState(
    initialData?.affiliate_url || "",
  );
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || "");
  const [isPublished, setIsPublished] = useState(
    initialData ? initialData.is_published : true,
  );
  const [isFeatured, setIsFeatured] = useState(
    initialData ? initialData.is_featured : false,
  );

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validation state
  const [formError, setFormError] = useState<string | null>(null);

  // Selected Category Object for Live Preview
  const selectedCategory = categories.find((c) => c.id === categoryId);

  // Handle Image Upload
  const handleFileUpload = async (file: File) => {
    setUploadError(null);
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await uploadImageAction(formData);
    setIsUploading(false);

    if (res.error) {
      setUploadError(res.error);
      toastError(res.error);
    } else if (res.url) {
      setImageUrl(res.url);
      success("Image uploaded successfully!");
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError("Please enter a product name.");
      return;
    }

    if (!affiliateUrl.trim()) {
      setFormError("Please enter an affiliate URL.");
      return;
    }

    if (!isValidAffiliateUrl(affiliateUrl)) {
      setFormError("Affiliate URL must be a valid https:// address.");
      return;
    }

    startTransition(async () => {
      const payload = {
        title: title.trim(),
        category_id: categoryId || null,
        price: price ? Number(price) : null,
        short_description: shortDescription.trim() || undefined,
        description: description.trim() || undefined,
        affiliate_url: affiliateUrl.trim(),
        image_url: imageUrl || undefined,
        is_published: isPublished,
        is_featured: isFeatured,
      };

      if (initialData?.id) {
        const res = await updateProductAction(initialData.id, payload);
        if (res.error) {
          setFormError(res.error);
          toastError(res.error);
        } else {
          success("Product updated successfully!");
          router.push("/admin/products");
          router.refresh();
        }
      } else {
        const res = await createProductAction(payload);
        if (res.error) {
          setFormError(res.error);
          toastError(res.error);
        } else {
          success("Product created successfully!");
          router.push("/admin/products");
          router.refresh();
        }
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="text-xs font-semibold tracking-wider text-muted uppercase">
            Products / {initialData ? "Edit" : "New"}
          </div>
          <h1 className="font-heading text-3xl font-bold text-charcoal-deep">
            {initialData ? "Edit product" : "Add a new product"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="px-5 py-2 rounded-full border border-border bg-white hover:bg-neutral-50 text-charcoal-deep font-medium text-sm transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending || isUploading}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-accent hover:bg-accent-hover text-white font-medium text-sm transition-colors shadow-sm disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save product"
            )}
          </button>
        </div>
      </div>

      {formError && (
        <div className="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Main two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Fields */}
        <div className="lg:col-span-7 bg-white border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          {/* 1. Product Image Drag & Drop */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-charcoal-deep">
              Product image
            </label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-accent rounded-xl p-6 text-center cursor-pointer transition-colors bg-cream/40 relative min-h-[160px] flex flex-col items-center justify-center group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />

              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-accent" />
                  <span className="text-xs text-muted">Uploading image...</span>
                </div>
              ) : imageUrl ? (
                <div className="relative w-full flex items-center justify-center">
                  <div className="relative w-36 h-36 rounded-lg overflow-hidden border border-border shadow-sm">
                    <Image
                      src={imageUrl}
                      alt="Uploaded preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageUrl("");
                    }}
                    className="absolute -top-2 -right-2 bg-charcoal text-white rounded-full p-1 shadow hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 bg-white rounded-full shadow-xs group-hover:scale-105 transition-transform">
                    <Upload className="w-5 h-5 text-muted" />
                  </div>
                  <div className="text-sm font-medium text-charcoal-deep">
                    Drop an image here or choose a file
                  </div>
                  <div className="text-xs text-muted">JPG, PNG or WebP (max 2MB)</div>
                </div>
              )}
            </div>
            {uploadError && (
              <p className="text-xs text-red-600 mt-1">{uploadError}</p>
            )}
          </div>

          {/* 2. Product Name */}
          <div className="space-y-2">
            <label htmlFor="product-name" className="block text-sm font-semibold text-charcoal-deep">
              Product name
            </label>
            <input
              id="product-name"
              type="text"
              required
              placeholder="e.g. Premium hair dryer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-charcoal-deep placeholder:text-muted/60 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
          </div>

          {/* 3. Category & Price (side-by-side) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="product-category" className="block text-sm font-semibold text-charcoal-deep">
                Category
              </label>
              <select
                id="product-category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-charcoal-deep text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="product-price" className="block text-sm font-semibold text-charcoal-deep">
                Price <span className="font-normal text-muted">(optional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted font-medium">
                  ₹
                </span>
                <input
                  id="product-price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-border bg-white text-charcoal-deep placeholder:text-muted/60 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                />
              </div>
            </div>
          </div>

          {/* 4. Short Description */}
          <div className="space-y-2">
            <label htmlFor="short-desc" className="block text-sm font-semibold text-charcoal-deep">
              Short description
            </label>
            <textarea
              id="short-desc"
              rows={2}
              placeholder="Why do you recommend it? (Shown on cards)"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-charcoal-deep placeholder:text-muted/60 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-none"
            />
          </div>

          {/* Detailed Description */}
          <div className="space-y-2">
            <label htmlFor="full-desc" className="block text-sm font-semibold text-charcoal-deep">
              Detailed description <span className="font-normal text-muted">(shown on product page)</span>
            </label>
            <textarea
              id="full-desc"
              rows={3}
              placeholder="More details, sizing advice, key specs, or pros & cons..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-charcoal-deep placeholder:text-muted/60 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-none"
            />
          </div>

          {/* 5. Affiliate Link */}
          <div className="space-y-2">
            <label htmlFor="affiliate-link" className="block text-sm font-semibold text-charcoal-deep">
              Affiliate link
            </label>
            <input
              id="affiliate-link"
              type="url"
              required
              placeholder="https://amzn.to/... or any https:// store link"
              value={affiliateUrl}
              onChange={(e) => setAffiliateUrl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-charcoal-deep placeholder:text-muted/60 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
            <p className="text-xs text-muted">
              Visitors are sent here when they tap Shop now. Keep the full link, including tracking parameters.
            </p>
          </div>

          {/* 6. Checkboxes: Publish & Featured */}
          <div className="pt-2 flex flex-col sm:flex-row gap-6 border-t border-border">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 rounded border-border text-accent focus:ring-accent accent-accent"
              />
              <span className="text-sm font-medium text-charcoal-deep">
                Publish immediately
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded border-border text-accent focus:ring-accent accent-accent"
              />
              <span className="text-sm font-medium text-charcoal-deep">
                Show in Featured
              </span>
            </label>
          </div>
        </div>

        {/* Right Column: Live Preview on the Live Site */}
        <div className="lg:col-span-5 space-y-3 sticky top-6">
          <div className="text-[11px] font-bold tracking-wider uppercase text-muted">
            Preview on the live site
          </div>

          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-4">
            {/* Live Product Card */}
            <div className="space-y-3.5">
              {/* Product Image Box */}
              <div
                className="relative aspect-square w-full rounded-xl overflow-hidden flex items-center justify-center transition-colors"
                style={{
                  backgroundColor: selectedCategory?.color
                    ? `${selectedCategory.color}15`
                    : "#F3E8E0",
                }}
              >
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={title || "Product preview"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-deep/40 bg-white/70 px-3 py-1.5 rounded-full backdrop-blur-xs">
                    Product image
                  </span>
                )}
              </div>

              {/* Category label */}
              <div className="text-[11px] font-bold tracking-wider uppercase text-accent">
                {selectedCategory?.name || "Category"}
              </div>

              {/* Title & Price */}
              <div className="space-y-1">
                <h3 className="font-heading text-lg font-bold text-charcoal-deep leading-snug">
                  {title || "Product title appears here"}
                </h3>
                {price && Number(price) > 0 && (
                  <div className="text-sm font-semibold text-charcoal">
                    {formatPrice(Number(price))}
                  </div>
                )}
              </div>

              {/* Short description */}
              <p className="text-xs text-body leading-relaxed line-clamp-2">
                {shortDescription || "Your description appears here."}
              </p>

              {/* Action Buttons row */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  className="px-5 py-2 rounded-full bg-charcoal text-white text-xs font-semibold hover:bg-charcoal-deep transition-colors"
                >
                  Shop now
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-border/60 text-[11px] text-muted">
              Saved products appear on the website straight away. No redeploy needed.
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
