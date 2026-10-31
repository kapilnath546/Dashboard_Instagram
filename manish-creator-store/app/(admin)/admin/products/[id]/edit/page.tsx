import { requireAdmin } from "@/lib/supabase/admin-auth";
import { ProductForm } from "@/components/admin/ProductForm";
import { notFound } from "next/navigation";
import type { Category, Product } from "@/lib/types/database";


interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  // Fetch product to edit
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !product) {
    notFound();
  }

  // Fetch categories
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <ProductForm
      categories={(categories as Category[]) || []}
      initialData={product as Product}
    />
  );
}
