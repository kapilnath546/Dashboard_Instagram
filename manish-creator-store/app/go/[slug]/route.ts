import { NextRequest, NextResponse } from "next/server";
import { notFound } from "next/navigation";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";


interface RouteProps {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: RouteProps) {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  // 1. Extract visitor headers
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const rawIp = forwardedFor ? forwardedFor.split(",")[0].trim() : realIp || "127.0.0.1";

  // 2. Compute HMAC-SHA256 of IP using server-only CLICK_SALT (never store raw IP)
  const salt = process.env.CLICK_SALT;
  let ipHash: string | null = null;
  if (salt) {
    ipHash = crypto.createHmac("sha256", salt).update(rawIp).digest("hex");
  }

  const userAgent = request.headers.get("user-agent") || null;
  const referrer = request.headers.get("referer") || null;
  const country = request.headers.get("x-vercel-ip-country") || null;

  // 3. Call record_click() RPC (SECURITY DEFINER)
  const supabase = await createClient();
  const { data: affiliateUrl, error } = await supabase.rpc("record_click", {
    p_slug: slug,
    p_ip_hash: ipHash,
    p_user_agent: userAgent,
    p_referrer: referrer,
    p_country: country,
  });

  if (error || !affiliateUrl || typeof affiliateUrl !== "string") {
    notFound();
  }

  // 4. Validate that returned URL starts with https:// (strict redirect safety)
  try {
    const parsed = new URL(affiliateUrl);
    if (parsed.protocol !== "https:") {
      notFound();
    }
  } catch {
    notFound();
  }

  // 5. 302 Found Redirect to exact stored affiliate URL (parameters intact)
  return NextResponse.redirect(affiliateUrl, 302);
}
