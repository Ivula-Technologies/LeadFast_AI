import { getOwnedBusiness, getRequestUser, unauthorized } from "@/lib/auth";
import { PLANS, getEntitlement } from "@/lib/billing";
import { supabase } from "@/lib/supabase";

// GET /api/billing/status?business_id=... -> trial/subscription state for the dashboard.
export async function GET(request: Request) {
  const user = await getRequestUser(request);
  if (!user) return unauthorized();

  const businessId = new URL(request.url).searchParams.get("business_id") || "";
  const business = await getOwnedBusiness(user.id, businessId);
  if (!business) {
    return Response.json({ message: "Business not found." }, { status: 404 });
  }

  const entitlement = await getEntitlement(business.id);
  const plans = Object.values(PLANS).map(({ key, name, priceLabel, monthlyReplies, priceId }) => ({
    key,
    name,
    priceLabel,
    monthlyReplies,
    available: Boolean(priceId),
  }));

  // Leads this month that had an email address but got no instant reply, so the
  // upgrade prompt can say what being on a plan would have caught.
  let missedThisMonth = 0;
  if (entitlement && !entitlement.canAutoReply && supabase) {
    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
    const { count } = await supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("business_id", business.id)
      .eq("auto_replied", false)
      .not("lead_email", "is", null)
      .gte("created_at", monthStart);
    missedThisMonth = count ?? 0;
  }

  return Response.json({ entitlement, plans, missedThisMonth });
}
