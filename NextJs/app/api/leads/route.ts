import { supabase } from "@/lib/supabase";
import { getOwnedBusiness, getRequestUser, unauthorized } from "@/lib/auth";
import { CORS_HEADERS, handleLeadSubmission } from "@/lib/leads";

// GET /api/leads?business_id=... - the signed-in owner's leads for one business.
export async function GET(request: Request) {
  if (!supabase) {
    return Response.json({ success: false, error: "Supabase client not configured" }, { status: 500 });
  }

  const user = await getRequestUser(request);
  if (!user) return unauthorized();

  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get("business_id") || searchParams.get("businessId") || "";
  const business = await getOwnedBusiness(user.id, businessId);
  if (!business) {
    return Response.json({ success: false, error: "Business not found." }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }

  return Response.json({ success: true, data });
}

// POST /api/leads - public intake used by embed.js on contractors' websites.
export async function POST(request: Request) {
  return handleLeadSubmission(request);
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
