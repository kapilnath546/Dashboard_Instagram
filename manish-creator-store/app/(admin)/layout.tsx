import { requireAdmin } from "@/lib/supabase/admin-auth";
import { AdminSidebar } from "@/components/admin/Sidebar";
import { ToastProvider } from "@/components/ui/toast";


export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side check: must be logged in AND whitelisted in admin_users
  await requireAdmin();

  return (
    <ToastProvider>
      <div className="min-h-screen bg-cream flex flex-col md:flex-row text-body antialiased">
        <AdminSidebar />
        <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full overflow-y-auto">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}
