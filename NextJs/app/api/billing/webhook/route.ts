import type Stripe from "stripe";
import { supabase } from "@/lib/supabase";
import { isPlanKey, planFromPriceId, stripe } from "@/lib/billing";

// POST /api/billing/webhook - Stripe events keep the billing table in sync.
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !supabase || !secret) {
    return Response.json({ error: "Billing is not configured." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return Response.json({ error: "Missing signature." }, { status: 400 });
  }

  const payload = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch {
    return Response.json({ error: "Invalid signature." }, { status: 400 });
  }

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      await syncSubscription(event.data.object);
      break;
    }
    case "checkout.session.completed": {
      const session = event.data.object;
      if (session.mode === "subscription" && typeof session.subscription === "string") {
        await syncSubscription(await stripe.subscriptions.retrieve(session.subscription));
      }
      break;
    }
  }

  return Response.json({ received: true });
}

async function syncSubscription(subscription: Stripe.Subscription) {
  if (!supabase) return;

  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const item = subscription.items.data[0];
  const priceId = item?.price.id ?? null;
  const metaPlan = subscription.metadata?.plan;
  const plan = planFromPriceId(priceId) ?? (isPlanKey(metaPlan) ? metaPlan : null);

  let businessId = subscription.metadata?.business_id;
  if (!businessId) {
    const { data } = await supabase
      .from("billing")
      .select("business_id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();
    businessId = data?.business_id;
  }
  if (!businessId) {
    console.error("Stripe subscription without a known business:", subscription.id);
    return;
  }

  const { error } = await supabase.from("billing").upsert({
    business_id: businessId,
    plan,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    stripe_price_id: priceId,
    subscription_status: subscription.status,
    current_period_end: item?.current_period_end
      ? new Date(item.current_period_end * 1000).toISOString()
      : null,
    updated_at: new Date().toISOString(),
  });

  if (error) console.error("Failed to sync subscription:", error);
}
