import { getOwnedBusiness, getRequestUser, unauthorized } from "@/lib/auth";
import { handleLeadSubmission } from "@/lib/leads";

// POST /api/leads/test { business_id } - sends a sample enquiry through the real
// intake, addressed to the contractor's own login email, so they can see the
// instant reply land in their inbox before installing anything.
export async function POST(request: Request) {
  const user = await getRequestUser(request);
  if (!user) return unauthorized();

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Invalid JSON body." }, { status: 400 });
  }

  const business = await getOwnedBusiness(user.id, typeof body.business_id === "string" ? body.business_id : "");
  if (!business) {
    return Response.json({ message: "Business not found." }, { status: 404 });
  }

  const email = user.email || business.contact_email;
  if (!email) {
    return Response.json({ message: "Your account has no email address to send the test to." }, { status: 400 });
  }

  // Same rate limits, validation and reply path as a real website lead.
  const headers = new Headers({ "Content-Type": "application/json" });
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) headers.set("x-forwarded-for", forwardedFor);

  return handleLeadSubmission(
    new Request(request.url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        business_id: business.id,
        name: "Test Customer",
        email,
        message:
          "Hi, this is a LeadFast test lead. I'd like a quote for a repair at my home next week. What's the earliest you could come out?",
      }),
    })
  );
}
