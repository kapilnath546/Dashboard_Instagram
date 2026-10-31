"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Instagram } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/types/database";

interface NavbarProps {
  profile: Profile;
}

export function Navbar({ profile }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const instagramLink =
    profile.instagram_url || "https://www.instagram.com/manishh_mk_/";

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "My Finds" },
    { href: "/about", label: "About" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-cream/90 backdrop-blur-md border-b border-border/80">
      <div className="max-w-site mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href="/"
          className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-charcoal-deep hover:opacity-90 transition-opacity"
        >
          {profile.full_name || "Manish"}
          <span className="text-accent">.</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors relative py-1",
                  isActive
                    ? "text-charcoal-deep font-semibold"
                    : "text-body hover:text-charcoal-deep",
                )}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA Button */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href={instagramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-charcoal hover:bg-charcoal-deep text-white font-medium text-xs tracking-wide transition-all duration-150 shadow-sm hover:scale-[1.02]"
          >
            <Instagram className="w-3.5 h-3.5 text-accent" />
            Follow on Instagram
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-charcoal-deep rounded-lg hover:bg-black/5"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-cream px-6 py-6 space-y-4 animate-in slide-in-from-top-3 duration-200">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "text-base font-medium py-1.5 transition-colors",
                    isActive
                      ? "text-charcoal-deep font-bold"
                      : "text-body hover:text-charcoal-deep",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="pt-3 border-t border-border">
            <a
              href={instagramLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-charcoal text-white font-medium text-sm transition-colors"
            >
              <Instagram className="w-4 h-4 text-accent" />
              Follow on Instagram
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
