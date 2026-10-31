import Image from "next/image";
import { Instagram, MessageCircle } from "lucide-react";
import type { Profile } from "@/lib/types/database";

interface AboutSnippetProps {
  profile: Profile;
}

export function AboutSnippet({ profile }: AboutSnippetProps) {
  const instagramUrl =
    profile.instagram_url || "https://www.instagram.com/manishh_mk_/";
  const whatsappUrl = profile.whatsapp_url;

  // Split bio by double newline if present
  const bioParagraphs = (profile.bio || "")
    .split("\n\n")
    .filter(Boolean);

  return (
    <section className="py-12 sm:py-16 grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-14 items-center border-t border-border/80">
      {/* Left: Secondary photo */}
      <div className="md:col-span-5 flex justify-center md:justify-start">
        <div className="relative w-full max-w-[340px] aspect-square min-h-[300px] sm:min-h-[340px] rounded-3xl overflow-hidden border border-border shadow-sm bg-[#EFECE4] flex items-center justify-center">
          {profile.secondary_photo_url ? (
            <Image
              src={profile.secondary_photo_url}
              alt="About Manish"
              fill
              sizes="(max-width: 768px) 100vw, 360px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full min-h-[300px] sm:min-h-[340px] flex items-end p-5 bg-[repeating-linear-gradient(45deg,#E8E4DA,#E8E4DA_15px,#ECE8DE_15px,#ECE8DE_30px)]">
              <span className="text-[10px] font-bold tracking-wider uppercase text-charcoal-deep/60 bg-white/90 backdrop-blur-xs px-3.5 py-1.5 rounded-full shadow-xs">
                Second photo
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Right: Bio & Story */}
      <div className="md:col-span-7 space-y-6">
        <div className="space-y-2">
          <span className="text-xs font-bold tracking-widest uppercase text-muted">
            About
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-charcoal-deep">
            Hi, I&apos;m {profile.full_name || "Manish"}.
          </h2>
        </div>

        <div className="space-y-4 text-sm sm:text-base text-body leading-relaxed">
          {bioParagraphs.length > 0 ? (
            bioParagraphs.map((para, idx) => <p key={idx}>{para}</p>)
          ) : (
            <>
              <p>
                Welcome to my curated store. Every product linked here is something I personally use, test, or genuinely recommend from my Instagram posts.
              </p>
              <p>
                I carefully research each item so you can shop with confidence, getting direct access to verified store links without searching around.
              </p>
            </>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-charcoal hover:bg-charcoal-deep text-white font-medium text-xs sm:text-sm transition-colors shadow-xs"
          >
            <Instagram className="w-4 h-4 text-accent" />
            Instagram
          </a>
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-border bg-white hover:bg-neutral-50 text-charcoal-deep font-medium text-xs sm:text-sm transition-colors shadow-2xs"
            >
              <MessageCircle className="w-4 h-4 text-green-600" />
              WhatsApp
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
