import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/leads";
import { sendPushToBusiness } from "@/lib/push";

// GET /api/cron/lead-nudges - run every hour from a cPanel cron job:
//   curl -fsS -H "Authorization: Bearer $CRON_SECRET" https://leadfast.ivulatechnologies.com/api/cron/lead-nudges
// A lead still marked "New" two hours after it arrived usually means nobody
// called back yet, and that lead is going to a competitor. This sends the
// contractor one phone alert and one email per business listing those leads.
// Each lead is nudged once: leads.nudged_at is claimed before anything is sent,
// so overlapping runs can't double up.
const HOUR = 3_600_000;
const NUDGE_AFTER = 2 * HOUR;
// Older leads were either handled outside LeadFast or are already lost.
const GIVE_UP_AFTER = 48 * HOUR;

interface WaitingLead {
  id: string;
  business_id: string;
  lead_name: string | null;
  lead_phone: string | null;
  lead_email: string | null;
  created_at: string;
}

function waited(createdAt: string, now: number) {
  const hours = Math.floor((now - new Date(createdAt).getTime()) / HOUR);
  return hours >= 24 ? `${Math.floor(hours / 24)}d` : `${hours}h`;
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!supabase) return Response.json({ error: "Database is not configured." }, { status: 503 });

  const now = Date.now();
  const { data: claimed, error } = await supabase
    .from("leads")
    .update({ nudged_at: new Date(now).toISOString() })
    .eq("status", "New")
    .is("nudged_at", null)
    .lte("created_at", new Date(now - NUDGE_AFTER).toISOString())
    .gt("created_at", new Date(now - GIVE_UP_AFTER).toISOString())
    .select("id, business_id, lead_name, lead_phone, lead_email, created_at");
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const byBusiness = new Map<string, WaitingLead[]>();
  for (const lead of (claimed ?? []) as WaitingLead[]) {
    if (!lead.business_id) continue;
    const list = byBusiness.get(lead.business_id) ?? [];
    list.push(lead);
    byBusiness.set(lead.business_id, list);
  }

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
  let businesses = 0;
  const errors: string[] = [];

  for (const [businessId, leads] of byBusiness) {
    leads.sort((a, b) => a.created_at.localeCompare(b.created_at));
    const { data: business } = await supabase
      .from("businesses")
      .select("business_name, contact_email")
      .eq("id", businessId)
      .maybeSingle<{ business_name: string; contact_email: string | null }>();
    if (!business) continue;
    businesses++;

    const first = leads[0];
    const firstName = first.lead_name || "A customer";
    const title =
      leads.length === 1
        ? `${firstName} is still waiting for a call`
        : `${leads.length} leads are still waiting for a call`;
    const body =
      leads.length === 1
        ? `They asked ${waited(first.created_at, now)} ago. Call back now to win the job.`
        : `The oldest asked ${waited(first.created_at, now)} ago. Call back now to win the jobs.`;

    const push = sendPushToBusiness(businessId, {
      title,
      body,
      url: "/dashboard",
      tag: `nudge-${businessId}`,
    }).catch((err) => {
      errors.push(`${businessId} push: ${err instanceof Error ? err.message : String(err)}`);
    });

    const email = business.contact_email
      ? sendEmail({
          fromName: "LeadFast",
          to: business.contact_email,
          subject: title,
          text: [
            `Hi ${business.business_name},`,
            "",
            leads.length === 1
              ? "This lead is still marked New in LeadFast:"
              : "These leads are still marked New in LeadFast:",
            "",
            ...leads.map((l) =>
              [
                `- ${l.lead_name || "Unnamed lead"} (${waited(l.created_at, now)} ago)`,
                l.lead_phone ? `  Phone: ${l.lead_phone}` : null,
                l.lead_email ? `  Email: ${l.lead_email}` : null,
              ]
                .filter(Boolean)
                .join("\n")
            ),
            "",
            "Most customers hire the first business that calls them back. Once you've reached them, set the lead to Contacted so we stop reminding you.",
            "",
            appUrl ? `${appUrl}/dashboard` : "Open your LeadFast dashboard.",
            "",
            "LeadFast",
          ].join("\n"),
        }).then((delivery) => {
          if (delivery !== "sent") errors.push(`${businessId} email: ${delivery}`);
        })
      : Promise.resolve();

    await Promise.all([push, email]);
  }

  return Response.json(
    { leads: claimed?.length ?? 0, businesses, errors },
    { status: errors.length ? 207 : 200 }
  );
}
