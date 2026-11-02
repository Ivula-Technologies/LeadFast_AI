import webpush from "web-push";
import { supabase } from "@/lib/supabase";

// Phone alerts for new leads (Web Push). Optional: without the VAPID keys the
// app works as before and only email alerts go out.
const publicKey = process.env.VAPID_PUBLIC_KEY || "";
const privateKey = process.env.VAPID_PRIVATE_KEY || "";
const subject = process.env.VAPID_SUBJECT || `mailto:${process.env.SUPPORT_EMAIL || "contact@ivula.co.ke"}`;

export const pushEnabled = Boolean(publicKey && privateKey);
export const vapidPublicKey = publicKey;

if (pushEnabled) webpush.setVapidDetails(subject, publicKey, privateKey);

export interface PushPayload {
  title: string;
  body: string;
  url: string;
  tag?: string;
}

// Sends to every phone/browser the business turned alerts on for. Gone
// subscriptions (uninstalled app, revoked permission) are deleted.
export async function sendPushToBusiness(businessId: string, payload: PushPayload) {
  if (!pushEnabled || !supabase) return;

  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("business_id", businessId);
  if (!subs?.length) return;

  const message = JSON.stringify(payload);
  const gone: string[] = [];

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          message,
          { TTL: 60 * 60 * 24, urgency: "high" }
        );
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) gone.push(sub.id);
        else console.error("Push alert failed:", status ?? err);
      }
    })
  );

  if (gone.length) await supabase.from("push_subscriptions").delete().in("id", gone);
}
