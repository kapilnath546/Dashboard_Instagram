import Link from "next/link";
import Image from "next/image";
import { Instagram, ArrowRight } from "lucide-react";
import type { Profile } from "@/lib/types/database";

interface HeroSectionProps {
  profile: Profile;
}

export function HeroSection({ profile }: HeroSectionProps) {
  const instagramUrl =
    profile.instagram_url || "https://www.instagram.com/manishh_mk_/";
  const handle = profile.handle || "@manishh_mk_";

  return (
    <section className="py-8 sm:py-16 grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
      {/* Left text column */}
      <div className="md:col-span-7 space-y-6">
        <div className="flex items-center gap-2">
          <span className="w-6 h-0.5 bg-accent" />
          <span className="text-xs font-bold tracking-widest uppercase text-body">
            Creator · Curated Finds
          </span>
        </div>

        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold text-charcoal-deep leading-[1.08] tracking-tight">
          Things I use, picked out and linked in one place.
        </h1>

        <p className="text-base sm:text-lg text-body leading-relaxed max-w-xl">
          Grooming, fashion, fitness and everyday finds from my Instagram, with a direct link to buy each one.
        </p>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-accent hover:bg-accent-hover text-white font-semibold text-sm transition-all duration-150 shadow-sm hover:scale-[1.02]"
          >
            Shop my finds
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border bg-white hover:bg-neutral-50 text-charcoal-deep font-semibold text-sm transition-all duration-150 shadow-2xs hover:scale-[1.02]"
          >
            <Instagram className="w-4 h-4 text-accent" />
            {handle}
          </a>
        </div>
      </div>

      {/* Right photo column */}
      <div className="md:col-span-5 flex justify-center md:justify-end">
        <div className="relative w-full max-w-[340px] sm:max-w-[380px] aspect-[4/5] min-h-[420px] sm:min-h-[470px] rounded-3xl overflow-hidden border border-border shadow-sm bg-[#EFECE4] flex items-center justify-center group">
          {/* Subtle decorative offset border matching design */}
          <div className="absolute inset-2 rounded-2xl border border-charcoal/10 pointer-events-none z-10" />

          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.full_name || "Manish"}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-cover"
            />
          ) : (
            /* Styled diagonal stripe aesthetic fallback */
            <div className="w-full h-full min-h-[420px] sm:min-h-[470px] flex items-end p-5 bg-[repeating-linear-gradient(45deg,#E8E4DA,#E8E4DA_15px,#ECE8DE_15px,#ECE8DE_30px)]">
              <span className="relative z-20 text-[10px] font-bold tracking-wider uppercase text-charcoal-deep/60 bg-white/90 backdrop-blur-xs px-3.5 py-1.5 rounded-full shadow-xs">
                Portrait photo of Manish
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
