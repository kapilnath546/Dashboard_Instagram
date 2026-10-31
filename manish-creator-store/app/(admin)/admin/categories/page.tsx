import { requireAdmin } from "@/lib/supabase/admin-auth";
import { CategoryManager } from "@/components/admin/CategoryManager";
import type { Category } from "@/lib/types/database";


export default async function AdminCategoriesPage() {
  const { supabase } = await requireAdmin();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  return <CategoryManager categories={(categories as Category[]) || []} />;
}
