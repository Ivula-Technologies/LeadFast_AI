import { supabase } from "@/lib/supabase";
import { getRequestUser, unauthorized } from "@/lib/auth";

// POST /api/register - creates a business owned by the signed-in user.
// The owner always comes from the verified access token, never the body.
export async function POST(request: Request) {
  if (!supabase) {
    return Response.json(
      { message: 'Server configuration error: Supabase admin client unavailable.' },
      { status: 500 }
    );
  }

  const user = await getRequestUser(request);
  if (!user) return unauthorized('Please sign in to create a business.');

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: 'Invalid JSON body.' }, { status: 400 });
  }

  const { business_name, trade, contact_email, contact_phone } = body;

  // Validate required fields (mirrors the businesses table constraints)
  if (typeof business_name !== 'string' || !business_name.trim()) {
    return Response.json({ message: 'business_name is required.' }, { status: 400 });
  }
  const email = typeof contact_email === 'string' && contact_email.trim() ? contact_email.trim() : user.email;
  if (!email) {
    return Response.json({ message: 'contact_email is required.' }, { status: 400 });
  }

  // Each business gets its own free trial; keep that from being farmed.
  const { count } = await supabase
    .from('businesses')
    .select('id', { count: 'exact', head: true })
    .eq('owner_id', user.id);
  if ((count ?? 0) >= 5) {
    return Response.json({ message: 'You can have up to 5 businesses. Contact support for more.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('businesses')
    .insert({
      owner_id: user.id,
      business_name: business_name.trim().slice(0, 120),
      trade: typeof trade === 'string' ? trade.trim().slice(0, 60) || null : null,
      contact_email: email.slice(0, 254),
      contact_phone: typeof contact_phone === 'string' ? contact_phone.trim().slice(0, 40) || null : null,
    })
    .select('id, business_name')
    .single();

  if (error) {
    console.error('Business insert error:', error);
    return Response.json({ message: 'Could not create the business.' }, { status: 500 });
  }

  return Response.json({ id: data.id, business_name: data.business_name }, { status: 201 });
}
