import { CORS_HEADERS, handleLeadSubmission } from "@/lib/leads";

// POST /api/lead-intake - public intake used by the hosted contact forms.
export async function POST(request: Request) {
  return handleLeadSubmission(request);
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
