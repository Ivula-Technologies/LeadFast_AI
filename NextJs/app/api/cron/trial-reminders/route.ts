import { supabase } from "@/lib/supabase";
import { PLANS, TRIAL_DAYS } from "@/lib/billing";
import { sendEmail } from "@/lib/leads";

// GET /api/cron/trial-reminders - run once a day from a cPanel cron job:
//   curl -fsS -H "Authorization: Bearer $CRON_SECRET" https://leadfast.ivulatechnologies.com/api/cron/trial-reminders
// Emails trial businesses three days before the trial ends and on the day it
// ends. Each business falls into a 24-hour window exactly once, so a daily
// run sends each reminder once without storing anything.
const DAY = 86_400_000;
const LIVE = new Set(["active", "trialing", "past_due"]);

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!supabase) return Response.json({ error: "Database is not configured." }, { status: 503 });

  const now = Date.now();
  const trialMs = TRIAL_DAYS * DAY;
  // Trial ends at created_at + TRIAL_DAYS.
  const windows = [
    { kind: "three_days" as const, from: now + 2 * DAY - trialMs, to: now + 3 * DAY - trialMs },
    { kind: "ended" as const, from: now - DAY - trialMs, to: now - trialMs },
  ];

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
  let sent = 0;
  const errors: string[] = [];

  for (const w of windows) {
    const { data: businesses, error } = await supabase
      .from("businesses")
      .select("id, business_name, contact_email, created_at")
      .gt("created_at", new Date(w.from).toISOString())
      .lte("created_at", new Date(w.to).toISOString());
    if (error) {
      errors.push(error.message);
      continue;
    }

    for (const business of businesses ?? []) {
      if (!business.contact_email) continue;
      const { data: billing } = await supabase
        .from("billing")
        .select("subscription_status")
        .eq("business_id", business.id)
        .maybeSingle();
      if (billing?.subscription_status && LIVE.has(billing.subscription_status)) continue;

      const { count } = await supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("business_id", business.id)
        .eq("auto_replied", true);
      const replies = count ?? 0;
      const proof = replies
        ? `So far LeadFast has replied to ${replies} of your leads within seconds.`
        : "Add the LeadFast form to your website so new leads get a reply within seconds.";

      const subject =
        w.kind === "three_days"
          ? `Your LeadFast trial ends in 3 days`
          : `Your LeadFast trial has ended`;
      const text = [
        `Hi ${business.business_name},`,
        "",
        w.kind === "three_days"
          ? "Your free LeadFast trial ends in 3 days. After that, new leads stop getting an instant reply."
          : "Your free LeadFast trial ended today, so new leads no longer get an instant reply.",
        "",
        proof,
        "",
        `Starter is ${PLANS.starter.priceLabel} for ${PLANS.starter.monthlyReplies} replies a month; Pro is ${PLANS.pro.priceLabel} for unlimited replies. Pick a plan here:`,
        appUrl ? `${appUrl}/dashboard` : "your LeadFast dashboard",
        "",
        "Questions? Just reply to this email.",
        "",
        "LeadFast",
      ].join("\n");

      const delivery = await sendEmail({
        fromName: "LeadFast",
        to: business.contact_email,
        replyTo: process.env.SUPPORT_EMAIL || undefined,
        subject,
        text,
      });
      if (delivery === "sent") sent++;
      else errors.push(`${business.id}: ${delivery}`);
    }
  }

  return Response.json({ sent, errors }, { status: errors.length ? 207 : 200 });
}
