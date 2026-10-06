import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

// Resolves the signed-in contractor from the `Authorization: Bearer <access_token>`
// header. The token is verified by Supabase, so the user id can be trusted.
export async function getRequestUser(request: Request): Promise<User | null> {
  if (!supabase) return null;

  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

// Returns the business when `userId` owns it, otherwise null.
export async function getOwnedBusiness(userId: string, businessId: string) {
  if (!supabase || !businessId) return null;

  const { data } = await supabase
    .from("businesses")
    .select("id, business_name, contact_email, owner_id")
    .eq("id", businessId)
    .eq("owner_id", userId)
    .maybeSingle();

  return data;
}

export function unauthorized(message = "Unauthorized.") {
  return Response.json({ message }, { status: 401 });
}
