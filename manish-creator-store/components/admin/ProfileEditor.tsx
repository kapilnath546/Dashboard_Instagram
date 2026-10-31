"use client";

import { useState, useTransition, useRef } from "react";
import Image from "next/image";
import { Upload, Loader2, Camera, Instagram, MessageCircle, Mail, Youtube, Facebook, Check } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { updateProfileAction, uploadImageAction } from "@/lib/actions/admin-actions";
import type { Profile } from "@/lib/types/database";

export function ProfileEditor({ profile }: { profile: Profile }) {
  const { success, error: toastError } = useToast();
  const [isPending, startTransition] = useTransition();

  // Form State
  const [fullName, setFullName] = useState(profile.full_name || "Manish");
  const [handle, setHandle] = useState(profile.handle || "@manishh_mk_");
  const [bio, setBio] = useState(profile.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || "");
  const [secondaryPhotoUrl, setSecondaryPhotoUrl] = useState(profile.secondary_photo_url || "");
  const [instagramUrl, setInstagramUrl] = useState(profile.instagram_url || "https://www.instagram.com/manishh_mk_/");
  const [whatsappUrl, setWhatsappUrl] = useState(profile.whatsapp_url || "");
  const [youtubeUrl, setYoutubeUrl] = useState(profile.youtube_url || "https://www.youtube.com/@manishh_mk");
  const [facebookUrl, setFacebookUrl] = useState(profile.facebook_url || "https://www.facebook.com/share/1CCdVhvnkv/?mibextid=wwXIfr");
  const [email, setEmail] = useState(profile.email || "");

  // Upload States
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingSecondary, setUploadingSecondary] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const secondaryInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File, type: "avatar" | "secondary") => {
    const isAvatar = type === "avatar";
    if (isAvatar) setUploadingAvatar(true);
    else setUploadingSecondary(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await uploadImageAction(formData);

    if (isAvatar) setUploadingAvatar(false);
    else setUploadingSecondary(false);

    if (res.error) {
      toastError(res.error);
    } else if (res.url) {
      if (isAvatar) setAvatarUrl(res.url);
      else setSecondaryPhotoUrl(res.url);
      success("Photo uploaded successfully!");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const res = await updateProfileAction({
        full_name: fullName,
        handle,
        bio,
        avatar_url: avatarUrl || undefined,
        secondary_photo_url: secondaryPhotoUrl || undefined,
        instagram_url: instagramUrl || undefined,
        whatsapp_url: whatsappUrl || undefined,
        youtube_url: youtubeUrl || undefined,
        facebook_url: facebookUrl || undefined,
        email: email || undefined,
      });

      if (res.error) {
        toastError(res.error);
      } else {
        success("Profile updated successfully!");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <p className="text-xs font-semibold tracking-wider uppercase text-muted">
            Creator Identity
          </p>
          <h1 className="font-heading text-3xl font-bold text-charcoal-deep">
            Profile & About
          </h1>
        </div>
        <button
          type="submit"
          disabled={isPending || uploadingAvatar || uploadingSecondary}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-accent hover:bg-accent-hover text-white font-medium text-sm transition-colors shadow-sm disabled:opacity-50 w-fit"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              Save changes
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Basic Info & Bio */}
        <div className="lg:col-span-8 bg-white border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="font-heading text-lg font-bold text-charcoal-deep border-b border-border pb-3">
            General Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-charcoal-deep">
                Display Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-charcoal-deep">
                Instagram Handle
              </label>
              <input
                type="text"
                required
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-charcoal-deep">
              Bio & Story
            </label>
            <textarea
              rows={5}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell your audience about who you are, what you test, and why they can trust your picks..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
            <p className="text-xs text-muted">
              Displayed in the &quot;Hi, I&apos;m Manish&quot; home section and on the About page.
            </p>
          </div>

          <h2 className="font-heading text-lg font-bold text-charcoal-deep border-b border-border pb-3 pt-4">
            Social & Contact Links
          </h2>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-semibold text-charcoal-deep">
                <Instagram className="w-3.5 h-3.5 text-accent" />
                Instagram URL
              </label>
              <input
                type="url"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://www.instagram.com/manishh_mk_/"
                className="w-full px-3.5 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-semibold text-charcoal-deep">
                <MessageCircle className="w-3.5 h-3.5 text-green-600" />
                WhatsApp Channel / Community Link
              </label>
              <input
                type="url"
                value={whatsappUrl}
                onChange={(e) => setWhatsappUrl(e.target.value)}
                placeholder="https://chat.whatsapp.com/... or https://wa.me/..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-semibold text-charcoal-deep">
                <Youtube className="w-3.5 h-3.5 text-red-600" />
                YouTube URL <span className="font-normal text-muted">(optional)</span>
              </label>
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://youtube.com/@..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-semibold text-charcoal-deep">
                <Facebook className="w-3.5 h-3.5 text-blue-600" />
                Facebook URL <span className="font-normal text-muted">(optional)</span>
              </label>
              <input
                type="url"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                placeholder="https://facebook.com/..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-semibold text-charcoal-deep">
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                Public Contact Email <span className="font-normal text-muted">(optional)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="collaborate@example.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Photos Upload */}
        <div className="lg:col-span-4 space-y-6">
          {/* Avatar Photo */}
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="space-y-1">
              <h3 className="font-heading text-sm font-bold text-charcoal-deep">
                Hero Portrait Photo
              </h3>
              <p className="text-xs text-muted">
                Shown on the home page hero banner.
              </p>
            </div>

            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleUpload(e.target.files[0], "avatar");
                }
              }}
            />

            <div
              onClick={() => avatarInputRef.current?.click()}
              className="relative aspect-3/4 rounded-xl overflow-hidden border-2 border-dashed border-border hover:border-accent bg-cream/50 cursor-pointer flex items-center justify-center transition-colors group"
            >
              {uploadingAvatar ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-accent" />
                  <span className="text-xs text-muted">Uploading...</span>
                </div>
              ) : avatarUrl ? (
                <>
                  <Image
                    src={avatarUrl}
                    alt="Manish Portrait"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium gap-2">
                    <Camera className="w-4 h-4" /> Change photo
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-center p-4">
                  <div className="p-3 bg-white rounded-full shadow-xs">
                    <Upload className="w-5 h-5 text-muted" />
                  </div>
                  <span className="text-xs font-semibold text-charcoal">
                    Upload hero photo
                  </span>
                  <span className="text-[11px] text-muted">JPG, PNG or WebP</span>
                </div>
              )}
            </div>

            {avatarUrl && (
              <button
                type="button"
                onClick={() => setAvatarUrl("")}
                className="text-xs text-red-600 hover:underline block text-center w-full"
              >
                Remove photo
              </button>
            )}
          </div>

          {/* Secondary Photo */}
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="space-y-1">
              <h3 className="font-heading text-sm font-bold text-charcoal-deep">
                About Section Photo
              </h3>
              <p className="text-xs text-muted">
                Shown alongside the &quot;Hi, I&apos;m Manish&quot; story.
              </p>
            </div>

            <input
              ref={secondaryInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleUpload(e.target.files[0], "secondary");
                }
              }}
            />

            <div
              onClick={() => secondaryInputRef.current?.click()}
              className="relative aspect-square rounded-xl overflow-hidden border-2 border-dashed border-border hover:border-accent bg-cream/50 cursor-pointer flex items-center justify-center transition-colors group"
            >
              {uploadingSecondary ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-accent" />
                  <span className="text-xs text-muted">Uploading...</span>
                </div>
              ) : secondaryPhotoUrl ? (
                <>
                  <Image
                    src={secondaryPhotoUrl}
                    alt="Manish Secondary"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium gap-2">
                    <Camera className="w-4 h-4" /> Change photo
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-center p-4">
                  <div className="p-3 bg-white rounded-full shadow-xs">
                    <Upload className="w-5 h-5 text-muted" />
                  </div>
                  <span className="text-xs font-semibold text-charcoal">
                    Upload secondary photo
                  </span>
                  <span className="text-[11px] text-muted">JPG, PNG or WebP</span>
                </div>
              )}
            </div>

            {secondaryPhotoUrl && (
              <button
                type="button"
                onClick={() => setSecondaryPhotoUrl("")}
                className="text-xs text-red-600 hover:underline block text-center w-full"
              >
                Remove photo
              </button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
