import { requireAdmin } from "@/lib/supabase/admin-auth";
import { ProductForm } from "@/components/admin/ProductForm";
import type { Category } from "@/lib/types/database";


export default async function NewProductPage() {
  const { supabase } = await requireAdmin();

  // Fetch all categories for selection dropdown
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  return <ProductForm categories={(categories as Category[]) || []} />;
}
