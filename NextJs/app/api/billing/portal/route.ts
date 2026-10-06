import { supabase } from "@/lib/supabase";
import { getOwnedBusiness, getRequestUser, unauthorized } from "@/lib/auth";
import { appUrl, stripe } from "@/lib/billing";

// POST /api/billing/portal { business_id } -> { url } of the Stripe customer portal.
export async function POST(request: Request) {
  if (!stripe || !supabase) {
    return Response.json({ message: "Billing is not configured yet." }, { status: 503 });
  }

  const user = await getRequestUser(request);
  if (!user) return unauthorized();

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Invalid JSON body." }, { status: 400 });
  }

  const business = await getOwnedBusiness(user.id, String(body?.business_id || ""));
  if (!business) {
    return Response.json({ message: "Business not found." }, { status: 404 });
  }

  const { data: billing } = await supabase
    .from("billing")
    .select("stripe_customer_id")
    .eq("business_id", business.id)
    .maybeSingle();

  if (!billing?.stripe_customer_id) {
    return Response.json({ message: "No subscription yet. Choose a plan first." }, { status: 400 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: billing.stripe_customer_id,
    return_url: `${appUrl(request)}/dashboard`,
  });

  return Response.json({ url: session.url });
}
