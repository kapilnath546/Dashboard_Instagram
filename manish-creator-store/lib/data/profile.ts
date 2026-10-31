import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types/database";

export const DEFAULT_PROFILE: Profile = {
  id: "",
  full_name: "Manish",
  handle: "@manishh_mk_",
  bio: "[Two or three sentences in Manish's own words: who he is, what he posts about and why people can trust his picks.]\n\n[A second short paragraph: how he chooses products and how often he posts new finds.]",
  avatar_url: null,
  secondary_photo_url: null,
  instagram_url: "https://www.instagram.com/manishh_mk_/",
  whatsapp_url: null,
  youtube_url: null,
  facebook_url: null,
  email: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

/**
 * Safely fetches the store creator profile.
 * Never throws or fails if the profile row has not yet been seeded;
 * returns DEFAULT_PROFILE as fallback.
 */
export async function getProfile(): Promise<Profile> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return DEFAULT_PROFILE;
    }

    return data as Profile;
  } catch {
    return DEFAULT_PROFILE;
  }
}
