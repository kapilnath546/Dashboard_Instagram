import { getProfile } from "@/lib/data/profile";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();

  return (
    <div className="min-h-screen flex flex-col bg-cream text-body selection:bg-accent/20">
      <Navbar profile={profile} />
      <main className="flex-1 max-w-site mx-auto w-full px-4 sm:px-6 lg:px-8">
        {children}
      </main>
      <Footer profile={profile} />
    </div>
  );
}
