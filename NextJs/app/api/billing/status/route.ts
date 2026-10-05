import { getOwnedBusiness, getRequestUser, unauthorized } from "@/lib/auth";
import { PLANS, getEntitlement } from "@/lib/billing";

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

  return Response.json({ entitlement, plans });
}
