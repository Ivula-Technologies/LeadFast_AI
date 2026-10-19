import { supabase } from "@/lib/supabase";
import { getOwnedBusiness, getRequestUser, unauthorized } from "@/lib/auth";
import { MAX_JOB_VALUE, isLeadStatus } from "@/lib/pipeline";

// PATCH /api/leads/[id] { status?, job_value? } - the owner moves a lead through the pipeline.
// Leads are only writable with the service role, so this is the one place they change.
export async function PATCH(request: Request, ctx: RouteContext<"/api/leads/[id]">) {
  if (!supabase) {
    return Response.json({ message: "Supabase client not configured." }, { status: 500 });
  }

  const user = await getRequestUser(request);
  if (!user) return unauthorized();

  const { id } = await ctx.params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Invalid JSON body." }, { status: 400 });
  }

  const { data: lead } = await supabase
    .from("leads")
    .select("id, business_id")
    .eq("id", id)
    .maybeSingle();
  if (!lead || !(await getOwnedBusiness(user.id, lead.business_id))) {
    return Response.json({ message: "Lead not found." }, { status: 404 });
  }

  const update: Record<string, unknown> = {};

  if (body.status !== undefined) {
    if (!isLeadStatus(body.status)) {
      return Response.json({ message: "Unknown status." }, { status: 400 });
    }
    update.status = body.status;
    update.status_updated_at = new Date().toISOString();
  }

  if (body.job_value !== undefined) {
    if (body.job_value === null || body.job_value === "") {
      update.job_value = null;
    } else {
      const value = Number(body.job_value);
      if (!Number.isFinite(value) || value < 0 || value > MAX_JOB_VALUE) {
        return Response.json({ message: "Job value must be a dollar amount." }, { status: 400 });
      }
      update.job_value = Math.round(value * 100) / 100;
    }
  }

  if (Object.keys(update).length === 0) {
    return Response.json({ message: "Nothing to update." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("leads")
    .update(update)
    .eq("id", lead.id)
    .select("*")
    .single();

  if (error) {
    console.error("Lead update failed:", error);
    return Response.json({ message: "Could not update the lead." }, { status: 500 });
  }

  return Response.json({ success: true, data });
}
