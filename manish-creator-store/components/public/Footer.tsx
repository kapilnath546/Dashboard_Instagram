import Link from "next/link";
import type { Profile } from "@/lib/types/database";

interface FooterProps {
  profile: Profile;
}

export function Footer({ profile }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const instagramUrl =
    profile.instagram_url || "https://www.instagram.com/manishh_mk_/";
  const youtubeUrl =
    profile.youtube_url || "https://www.youtube.com/@manishh_mk";
  const facebookUrl =
    profile.facebook_url || "https://www.facebook.com/share/1CCdVhvnkv/?mibextid=wwXIfr";

  return (
    <footer className="bg-[#181818] text-white py-12 border-t border-neutral-900 mt-16">
      <div className="max-w-site mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand logo */}
        <Link
          href="/"
          className="font-heading text-2xl font-bold tracking-tight text-white hover:text-neutral-200 transition-colors"
        >
          {profile.full_name || "Manish"}
          <span className="text-accent">.</span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-6 sm:gap-8 text-sm text-neutral-400">
          <Link href="/products" className="hover:text-white transition-colors">
            My Finds
          </Link>
          <Link href="/about" className="hover:text-white transition-colors">
            About
          </Link>
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            Instagram
          </a>
          <a
            href={youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            YouTube
          </a>
          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            Facebook
          </a>
        </div>

        {/* Copyright */}
        <p className="text-xs text-neutral-500">
          © {currentYear} {profile.full_name || "Manish"}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
