import { supabase } from "@/lib/supabase";
import { getRequestUser, unauthorized } from "@/lib/auth";

// GET /api/my-businesses - the signed-in owner's businesses, oldest first.
export async function GET(request: Request) {
  if (!supabase) {
    return Response.json(
      { message: 'Server configuration error: Supabase admin client unavailable.' },
      { status: 500 }
    );
  }

  const user = await getRequestUser(request);
  if (!user) return unauthorized();

  const { data, error } = await supabase
    .from('businesses')
    .select('id, business_name, trade, contact_email, contact_phone, created_at')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Fetch businesses error:', error);
    return Response.json({ message: 'Could not load your businesses.' }, { status: 500 });
  }

  return Response.json(data ?? []);
}
