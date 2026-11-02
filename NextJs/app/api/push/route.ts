import { getOwnedBusiness, getRequestUser, unauthorized } from "@/lib/auth";
import { pushEnabled, vapidPublicKey } from "@/lib/push";
import { supabase } from "@/lib/supabase";

// GET /api/push - whether phone alerts are available, and the key the browser
// needs to subscribe. The key is public; serving it here means it can be set
// in cPanel without rebuilding the app.
export function GET() {
  return Response.json({ enabled: pushEnabled, publicKey: pushEnabled ? vapidPublicKey : null });
}

function isHttpsUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 1000) return false;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function isKey(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 200 && /^[A-Za-z0-9_-]+=*$/.test(value);
}

// POST /api/push { business_id, subscription } - turn on alerts for this device.
export async function POST(request: Request) {
  if (!pushEnabled || !supabase) {
    return Response.json({ message: "Phone alerts aren't set up on this server yet." }, { status: 503 });
  }
  const user = await getRequestUser(request);
  if (!user) return unauthorized();

  const body = await request.json().catch(() => null);
  const business = await getOwnedBusiness(user.id, typeof body?.business_id === "string" ? body.business_id : "");
  if (!business) return Response.json({ message: "Business not found." }, { status: 404 });

  const sub = body?.subscription;
  if (!isHttpsUrl(sub?.endpoint) || !isKey(sub?.keys?.p256dh) || !isKey(sub?.keys?.auth)) {
    return Response.json({ message: "That browser sent an invalid subscription." }, { status: 400 });
  }

  const { error } = await supabase.from("push_subscriptions").upsert(
    { business_id: business.id, user_id: user.id, endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth },
    { onConflict: "endpoint" }
  );
  if (error) {
    console.error("Saving push subscription failed:", error.message);
    return Response.json({ message: "Could not turn on alerts. Try again." }, { status: 500 });
  }
  return Response.json({ ok: true });
}

// DELETE /api/push { endpoint } - turn off alerts for this device.
export async function DELETE(request: Request) {
  if (!supabase) return Response.json({ ok: true });
  const user = await getRequestUser(request);
  if (!user) return unauthorized();

  const body = await request.json().catch(() => null);
  if (!isHttpsUrl(body?.endpoint)) return Response.json({ message: "Missing endpoint." }, { status: 400 });

  await supabase.from("push_subscriptions").delete().eq("endpoint", body.endpoint).eq("user_id", user.id);
  return Response.json({ ok: true });
}
