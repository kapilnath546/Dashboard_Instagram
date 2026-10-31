"use server";

import { requireAdmin } from "@/lib/supabase/admin-auth";
import { revalidatePath } from "next/cache";
import { isValidAffiliateUrl, slugify } from "@/lib/utils";
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from "@/lib/constants";
import type { Product, Category, Profile } from "@/lib/types/database";

function revalidateAllStorefrontPages() {
  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/about");
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/profile");
}

/* ─────────────────────────────────────────────────────────────
 * PRODUCT MUTATIONS
 * ───────────────────────────────────────────────────────────── */

export async function createProductAction(formData: {
  title: string;
  slug?: string;
  short_description?: string;
  description?: string;
  image_url?: string;
  affiliate_url: string;
  price?: number | null;
  category_id?: string | null;
  is_published?: boolean;
  is_featured?: boolean;
}) {
  const { supabase } = await requireAdmin();

  // Validate affiliate URL
  if (!isValidAffiliateUrl(formData.affiliate_url)) {
    return { error: "Affiliate URL must be a valid https:// web address." };
  }

  // Ensure title is present
  const title = formData.title?.trim();
  if (!title) {
    return { error: "Product name is required." };
  }

  // Generate or sanitize slug
  let targetSlug = slugify(formData.slug?.trim() || title);
  if (!targetSlug) targetSlug = "product-" + Date.now();

  // Ensure unique slug
  const { data: existingSlug } = await supabase
    .from("products")
    .select("id")
    .eq("slug", targetSlug)
    .maybeSingle();

  if (existingSlug) {
    targetSlug = `${targetSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  // Compute next sort_order
  const { data: maxOrderData } = await supabase
    .from("products")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder = (maxOrderData?.sort_order ?? 0) + 1;

  const { data, error } = await supabase
    .from("products")
    .insert({
      title,
      slug: targetSlug,
      short_description: formData.short_description?.trim() || null,
      description: formData.description?.trim() || null,
      image_url: formData.image_url || null,
      affiliate_url: formData.affiliate_url.trim(),
      price: formData.price !== undefined && formData.price !== null ? Number(formData.price) : null,
      category_id: formData.category_id || null,
      is_published: !!formData.is_published,
      is_featured: !!formData.is_featured,
      sort_order: nextOrder,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidateAllStorefrontPages();
  return { success: true, product: data as Product };
}

export async function updateProductAction(
  id: string,
  formData: {
    title: string;
    slug?: string;
    short_description?: string;
    description?: string;
    image_url?: string;
    affiliate_url: string;
    price?: number | null;
    category_id?: string | null;
    is_published?: boolean;
    is_featured?: boolean;
  },
) {
  const { supabase } = await requireAdmin();

  if (!isValidAffiliateUrl(formData.affiliate_url)) {
    return { error: "Affiliate URL must be a valid https:// web address." };
  }

  const title = formData.title?.trim();
  if (!title) {
    return { error: "Product name is required." };
  }

  // Ensure slug uniqueness (excluding current product)
  let targetSlug = slugify(formData.slug?.trim() || title);
  if (!targetSlug) targetSlug = "product-" + Date.now();

  const { data: existingSlug } = await supabase
    .from("products")
    .select("id")
    .eq("slug", targetSlug)
    .neq("id", id)
    .maybeSingle();

  if (existingSlug) {
    targetSlug = `${targetSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  const { data, error } = await supabase
    .from("products")
    .update({
      title,
      slug: targetSlug,
      short_description: formData.short_description?.trim() || null,
      description: formData.description?.trim() || null,
      image_url: formData.image_url || null,
      affiliate_url: formData.affiliate_url.trim(),
      price: formData.price !== undefined && formData.price !== null ? Number(formData.price) : null,
      category_id: formData.category_id || null,
      is_published: !!formData.is_published,
      is_featured: !!formData.is_featured,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidateAllStorefrontPages();
  return { success: true, product: data as Product };
}

export async function deleteProductAction(id: string) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) {
    return { error: error.message };
  }

  revalidateAllStorefrontPages();
  return { success: true };
}

export async function toggleProductPublishedAction(id: string, currentState: boolean) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("products")
    .update({ is_published: !currentState })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidateAllStorefrontPages();
  return { success: true, is_published: !currentState };
}

export async function toggleProductFeaturedAction(id: string, currentState: boolean) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("products")
    .update({ is_featured: !currentState })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidateAllStorefrontPages();
  return { success: true, is_featured: !currentState };
}

export async function reorderProductAction(id: string, direction: "up" | "down") {
  const { supabase } = await requireAdmin();

  // Get current product
  const { data: currentProduct } = await supabase
    .from("products")
    .select("id, sort_order")
    .eq("id", id)
    .single();

  if (!currentProduct) return { error: "Product not found." };

  // Find adjacent product
  const query = supabase.from("products").select("id, sort_order");
  if (direction === "up") {
    query.lt("sort_order", currentProduct.sort_order).order("sort_order", { ascending: false });
  } else {
    query.gt("sort_order", currentProduct.sort_order).order("sort_order", { ascending: true });
  }

  const { data: adjacentProduct } = await query.limit(1).maybeSingle();

  if (!adjacentProduct) {
    // Already at the boundary
    return { success: true };
  }

  // Swap sort_order
  await supabase
    .from("products")
    .update({ sort_order: adjacentProduct.sort_order })
    .eq("id", currentProduct.id);

  await supabase
    .from("products")
    .update({ sort_order: currentProduct.sort_order })
    .eq("id", adjacentProduct.id);

  revalidateAllStorefrontPages();
  return { success: true };
}

/* ─────────────────────────────────────────────────────────────
 * CATEGORY MUTATIONS
 * ───────────────────────────────────────────────────────────── */

export async function createCategoryAction(formData: {
  name: string;
  slug?: string;
  description?: string;
  color?: string;
}) {
  const { supabase } = await requireAdmin();

  const name = formData.name?.trim();
  if (!name) return { error: "Category name is required." };

  let slug = slugify(formData.slug?.trim() || name);
  if (!slug) slug = "cat-" + Date.now();

  const { data: maxOrderData } = await supabase
    .from("categories")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder = (maxOrderData?.sort_order ?? 0) + 1;

  const { data, error } = await supabase
    .from("categories")
    .insert({
      name,
      slug,
      description: formData.description?.trim() || null,
      color: formData.color || "#C75B33",
      sort_order: nextOrder,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidateAllStorefrontPages();
  return { success: true, category: data as Category };
}

export async function updateCategoryAction(
  id: string,
  formData: {
    name: string;
    slug?: string;
    description?: string;
    color?: string;
  },
) {
  const { supabase } = await requireAdmin();

  const name = formData.name?.trim();
  if (!name) return { error: "Category name is required." };

  const slug = slugify(formData.slug?.trim() || name);

  const { data, error } = await supabase
    .from("categories")
    .update({
      name,
      slug,
      description: formData.description?.trim() || null,
      color: formData.color || "#C75B33",
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidateAllStorefrontPages();
  return { success: true, category: data as Category };
}

export async function deleteCategoryAction(id: string) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidateAllStorefrontPages();
  return { success: true };
}

export async function reorderCategoryAction(id: string, direction: "up" | "down") {
  const { supabase } = await requireAdmin();

  const { data: currentCat } = await supabase
    .from("categories")
    .select("id, sort_order")
    .eq("id", id)
    .single();

  if (!currentCat) return { error: "Category not found." };

  const query = supabase.from("categories").select("id, sort_order");
  if (direction === "up") {
    query.lt("sort_order", currentCat.sort_order).order("sort_order", { ascending: false });
  } else {
    query.gt("sort_order", currentCat.sort_order).order("sort_order", { ascending: true });
  }

  const { data: adjacentCat } = await query.limit(1).maybeSingle();

  if (!adjacentCat) return { success: true };

  await supabase
    .from("categories")
    .update({ sort_order: adjacentCat.sort_order })
    .eq("id", currentCat.id);

  await supabase
    .from("categories")
    .update({ sort_order: currentCat.sort_order })
    .eq("id", adjacentCat.id);

  revalidateAllStorefrontPages();
  return { success: true };
}

/* ─────────────────────────────────────────────────────────────
 * PROFILE MUTATIONS
 * ───────────────────────────────────────────────────────────── */

export async function updateProfileAction(formData: {
  full_name: string;
  handle: string;
  bio?: string;
  avatar_url?: string;
  secondary_photo_url?: string;
  instagram_url?: string;
  whatsapp_url?: string;
  youtube_url?: string;
  facebook_url?: string;
  email?: string;
}) {
  const { supabase } = await requireAdmin();

  // Fetch the single profile row ID if present
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .limit(1)
    .maybeSingle();

  const payload = {
    full_name: formData.full_name.trim() || "Manish",
    handle: formData.handle.trim() || "@manishh_mk_",
    bio: formData.bio?.trim() || null,
    avatar_url: formData.avatar_url || null,
    secondary_photo_url: formData.secondary_photo_url || null,
    instagram_url: formData.instagram_url?.trim() || null,
    whatsapp_url: formData.whatsapp_url?.trim() || null,
    youtube_url: formData.youtube_url?.trim() || null,
    facebook_url: formData.facebook_url?.trim() || null,
    email: formData.email?.trim() || null,
  };

  let error;
  let data;

  if (existingProfile) {
    const res = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", existingProfile.id)
      .select()
      .single();
    error = res.error;
    data = res.data;
  } else {
    const res = await supabase.from("profiles").insert(payload).select().single();
    error = res.error;
    data = res.data;
  }

  if (error) return { error: error.message };

  revalidateAllStorefrontPages();
  return { success: true, profile: data as Profile };
}

/* ─────────────────────────────────────────────────────────────
 * IMAGE UPLOAD MUTATION (Direct to product-images bucket)
 * ───────────────────────────────────────────────────────────── */

export async function uploadImageAction(formData: FormData) {
  const { supabase } = await requireAdmin();

  const file = formData.get("file") as File | null;
  if (!file) return { error: "No file provided." };

  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return { error: "Unsupported image format. Please use JPG, PNG or WebP." };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return { error: "File exceeds 2MB limit. Please upload a smaller image." };
  }

  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(fileName, file, {
      contentType: file.type,
      cacheControl: "31536000",
      upsert: false,
    });

  if (uploadError) return { error: uploadError.message };

  const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);

  return { success: true, url: data.publicUrl };
}
