import Stripe from "stripe";
import { supabase } from "@/lib/supabase";

export type PlanKey = "starter" | "pro";

export interface PlanInfo {
  key: PlanKey;
  name: string;
  priceLabel: string;
  // Automatic AI replies per calendar month. null = unlimited.
  monthlyReplies: number | null;
  priceId: string | undefined;
}

// Price IDs come from env so test/live Stripe objects can be swapped without a deploy.
export const PLANS: Record<PlanKey, PlanInfo> = {
  starter: {
    key: "starter",
    name: "Starter",
    priceLabel: "$49/mo",
    monthlyReplies: 100,
    priceId: process.env.STRIPE_PRICE_STARTER,
  },
  pro: {
    key: "pro",
    name: "Pro",
    priceLabel: "$99/mo",
    monthlyReplies: null,
    priceId: process.env.STRIPE_PRICE_PRO,
  },
};

export const TRIAL_DAYS = Number(process.env.TRIAL_DAYS || 14);
// Replies allowed during the free trial (keeps trial abuse cheap).
const TRIAL_MONTHLY_REPLIES = 100;

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export function planFromPriceId(priceId: string | null | undefined): PlanKey | null {
  if (!priceId) return null;
  for (const plan of Object.values(PLANS)) {
    if (plan.priceId && plan.priceId === priceId) return plan.key;
  }
  return null;
}

export function isPlanKey(value: unknown): value is PlanKey {
  return value === "starter" || value === "pro";
}

export interface Entitlement {
  // Whether new leads get an automatic AI reply right now.
  canAutoReply: boolean;
  state: "trial" | "active" | "trial_ended" | "inactive" | "cap_reached";
  plan: PlanKey | null;
  trialEndsAt: string | null;
  subscriptionStatus: string | null;
  repliesThisMonth: number;
  monthlyReplies: number | null;
}

const PAID_STATUSES = new Set(["active", "trialing", "past_due"]);

function startOfMonth() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

export async function getEntitlement(businessId: string): Promise<Entitlement | null> {
  if (!supabase) return null;

  const { data: business } = await supabase
    .from("businesses")
    .select("id, created_at")
    .eq("id", businessId)
    .maybeSingle();
  if (!business) return null;

  const { data: billing } = await supabase
    .from("billing")
    .select("plan, subscription_status")
    .eq("business_id", businessId)
    .maybeSingle();

  const { count } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("business_id", businessId)
    .eq("auto_replied", true)
    .gte("created_at", startOfMonth());
  const repliesThisMonth = count ?? 0;

  const trialEnds = new Date(new Date(business.created_at).getTime() + TRIAL_DAYS * 86_400_000);
  const status = billing?.subscription_status ?? null;
  const plan = isPlanKey(billing?.plan) ? billing.plan : null;

  const base = {
    plan,
    trialEndsAt: trialEnds.toISOString(),
    subscriptionStatus: status,
    repliesThisMonth,
  };

  if (status && PAID_STATUSES.has(status) && plan) {
    const cap = PLANS[plan].monthlyReplies;
    const underCap = cap === null || repliesThisMonth < cap;
    return { ...base, monthlyReplies: cap, canAutoReply: underCap, state: underCap ? "active" : "cap_reached" };
  }

  if (trialEnds.getTime() > Date.now()) {
    const underCap = repliesThisMonth < TRIAL_MONTHLY_REPLIES;
    return {
      ...base,
      monthlyReplies: TRIAL_MONTHLY_REPLIES,
      canAutoReply: underCap,
      state: underCap ? "trial" : "cap_reached",
    };
  }

  return {
    ...base,
    monthlyReplies: 0,
    canAutoReply: false,
    state: status ? "inactive" : "trial_ended",
  };
}

export function appUrl(request: Request) {
  return (process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin).replace(/\/$/, "");
}
