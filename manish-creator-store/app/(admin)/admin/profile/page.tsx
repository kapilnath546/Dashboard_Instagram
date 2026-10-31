import { requireAdmin } from "@/lib/supabase/admin-auth";
import { getProfile } from "@/lib/data/profile";
import { ProfileEditor } from "@/components/admin/ProfileEditor";


export default async function AdminProfilePage() {
  await requireAdmin();
  const profile = await getProfile();

  return <ProfileEditor profile={profile} />;
}
