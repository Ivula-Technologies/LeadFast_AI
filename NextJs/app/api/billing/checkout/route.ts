import { supabase } from "@/lib/supabase";
import { getOwnedBusiness, getRequestUser, unauthorized } from "@/lib/auth";
import { PLANS, appUrl, isPlanKey, stripe } from "@/lib/billing";

// POST /api/billing/checkout { business_id, plan } -> { url } of a Stripe Checkout page.
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

  const plan = body?.plan;
  if (!isPlanKey(plan)) {
    return Response.json({ message: "Unknown plan." }, { status: 400 });
  }
  const priceId = PLANS[plan].priceId;
  if (!priceId) {
    return Response.json({ message: "This plan isn't available yet." }, { status: 503 });
  }

  const business = await getOwnedBusiness(user.id, String(body?.business_id || ""));
  if (!business) {
    return Response.json({ message: "Business not found." }, { status: 404 });
  }

  const { data: billing } = await supabase
    .from("billing")
    .select("stripe_customer_id, subscription_status")
    .eq("business_id", business.id)
    .maybeSingle();

  // Plan changes for existing subscribers go through the customer portal,
  // otherwise Checkout would start a second subscription.
  if (billing?.subscription_status && ["active", "trialing", "past_due"].includes(billing.subscription_status)) {
    return Response.json({ message: "You already have a plan. Use Manage billing to change it." }, { status: 409 });
  }

  let customerId = billing?.stripe_customer_id as string | undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: business.contact_email || user.email,
      name: business.business_name,
      metadata: { business_id: business.id, owner_id: user.id },
    });
    customerId = customer.id;
    await supabase
      .from("billing")
      .upsert({ business_id: business.id, stripe_customer_id: customerId, updated_at: new Date().toISOString() });
  }

  const base = appUrl(request);
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: business.id,
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    subscription_data: { metadata: { business_id: business.id, plan } },
    metadata: { business_id: business.id, plan },
    success_url: `${base}/dashboard?billing=success`,
    cancel_url: `${base}/dashboard?billing=cancelled`,
  });

  return Response.json({ url: session.url });
}
