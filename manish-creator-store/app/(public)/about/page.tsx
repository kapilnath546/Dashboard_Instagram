import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Instagram, MessageCircle, ArrowRight } from "lucide-react";
import { getProfile } from "@/lib/data/profile";

export const metadata: Metadata = {
  title: "About Manish",
  description:
    "Learn about Manish (@manishh_mk_), his curation philosophy, and why you can trust his recommendations.",
};

export default async function AboutPage() {
  const profile = await getProfile();
  const instagramUrl =
    profile.instagram_url || "https://www.instagram.com/manishh_mk_/";
  const whatsappUrl = profile.whatsapp_url;

  const bioParagraphs = (profile.bio || "").split("\n\n").filter(Boolean);

  return (
    <div className="space-y-12 sm:space-y-16 py-8 sm:py-12 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="space-y-4 text-center sm:text-left">
        <span className="text-xs font-bold tracking-widest uppercase text-muted">
          About
        </span>
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-charcoal-deep tracking-tight">
          Hi, I&apos;m {profile.full_name || "Manish"}.
        </h1>
        <p className="text-base sm:text-lg text-body leading-relaxed max-w-2xl">
          I test, review, and curate everyday essentials across grooming, menswear, fitness, and Amazon finds so you don&apos;t have to second-guess what to buy.
        </p>
      </div>

      {/* Photos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
        {/* Primary Photo */}
        <div className="relative aspect-[4/5] min-h-[380px] rounded-3xl overflow-hidden border border-border shadow-sm bg-[#EFECE4] flex items-center justify-center">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.full_name || "Manish"}
              fill
              priority
              sizes="(max-width: 640px) 100vw, 400px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full min-h-[380px] flex items-end p-5 bg-[repeating-linear-gradient(45deg,#E8E4DA,#E8E4DA_15px,#ECE8DE_15px,#ECE8DE_30px)]">
              <span className="text-xs font-bold tracking-wider uppercase text-charcoal-deep/60 bg-white/90 px-3.5 py-1.5 rounded-full shadow-xs">
                Portrait photo
              </span>
            </div>
          )}
        </div>

        {/* Secondary Photo */}
        <div className="relative aspect-[4/5] min-h-[380px] rounded-3xl overflow-hidden border border-border shadow-sm bg-[#EFECE4] flex items-center justify-center">
          {profile.secondary_photo_url ? (
            <Image
              src={profile.secondary_photo_url}
              alt="Manish lifestyle"
              fill
              sizes="(max-width: 640px) 100vw, 400px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full min-h-[380px] flex items-end p-5 bg-[repeating-linear-gradient(45deg,#E8E4DA,#E8E4DA_15px,#ECE8DE_15px,#ECE8DE_30px)]">
              <span className="text-xs font-bold tracking-wider uppercase text-charcoal-deep/60 bg-white/90 px-3.5 py-1.5 rounded-full shadow-xs">
                Lifestyle photo
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Story & Philosophy */}
      <div className="bg-white border border-border rounded-3xl p-8 sm:p-10 shadow-xs space-y-6">
        <h2 className="font-heading text-2xl font-bold text-charcoal-deep">
          My Curation Philosophy
        </h2>

        <div className="space-y-4 text-base text-body leading-relaxed">
          {bioParagraphs.length > 0 ? (
            bioParagraphs.map((para, idx) => <p key={idx}>{para}</p>)
          ) : (
            <>
              <p>
                Social media is full of endless options and clutter. This storefront was built to be clean and simple: every link here points directly to products I actually own, wear, or use regularly.
              </p>
              <p>
                I carefully research each item so you can shop with confidence, getting direct access to verified store links without searching around.
              </p>
            </>
          )}
        </div>

        {/* Social Buttons */}
        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-border">
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-charcoal hover:bg-charcoal-deep text-white font-medium text-sm transition-colors shadow-xs"
          >
            <Instagram className="w-4 h-4 text-accent" />
            Follow on Instagram ({profile.handle || "@manishh_mk_"})
          </a>
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border bg-white hover:bg-neutral-50 text-charcoal-deep font-medium text-sm transition-colors shadow-2xs"
            >
              <MessageCircle className="w-4 h-4 text-green-600" />
              Join WhatsApp Updates
            </a>
          )}
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent hover:bg-accent-hover text-white font-medium text-sm transition-colors shadow-xs ml-auto"
          >
            Browse My Finds
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
