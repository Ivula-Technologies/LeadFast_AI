import { supabase, hasSupabaseConfig } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/rate-limit";
import { Resend } from "resend";
import Anthropic from "@anthropic-ai/sdk";

// Helper function to send confirmation email to lead via Resend & Claude AI
async function sendConfirmationEmail(name: string, email: string, message?: string) {
  if (!process.env.RESEND_API_KEY) {
    console.log("RESEND_API_KEY not configured. Skipping confirmation email.");
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  let emailContent = `Hello ${name},\n\nThank you for reaching out! We have received your request and our team will get back to you shortly.\n\nBest regards,\nCustomer Support Team`;

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const response = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 300,
        messages: [
          {
            role: "user",
            content: `You are writing a confirmation response on behalf of the service business team. A customer named ${name} submitted this lead request message: "${message || 'Service enquiry'}". Write a warm, friendly, concise, and professional confirmation email acknowledging their request and letting them know a team member will contact them shortly. Do NOT mention that you are an AI, bot, or automated system.`
          }
        ]
      });

      const text = response.content
        .filter((block: any) => block.type === "text")
        .map((block: any) => block.text)
        .join("\n");

      if (text) emailContent = text;
    } catch (err) {
      console.error("Confirmation reply generation failed, using standard template:", err);
    }
  }

  try {
    await resend.emails.send({
      from: "LeadFast <onboarding@resend.dev>",

      to: email,
      subject: "Confirmation: We received your request",
      text: emailContent
    });
    console.log(`Confirmation email sent successfully to ${email}`);
  } catch (emailErr) {
    console.error("Failed to send confirmation email via Resend:", emailErr);
  }
}

// GET /api/leads - Returns leads (optionally filtered by business_id) ordered by creation date
export async function GET(request: Request) {
  if (!supabase) {
    return Response.json(
      {
        success: false,
        error: "Supabase client not configured",
      },
      { status: 500 }
    );
  }

  const { searchParams} = new URL(request.url);
  const businessId = searchParams.get('business_id') || searchParams.get('businessId');

  let query = supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (businessId) {
    query = query.eq("business_id", businessId);
  }

  const { data, error } = await query;

  if (error) {
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }

  return Response.json(
    {
      success: true,
      data,
    },
    { status: 200 }
  );
}

// POST /api/leads - Inserts a new lead (with rate limiting and confirmation email)
export async function POST(request: Request) {
  const rateLimit = checkRateLimit(request, { windowMs: 60_000, maxRequests: 10 });

  if (!rateLimit.allowed) {
    return Response.json(
      { message: 'Too many lead submissions. Please wait before trying again.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } }
    );
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ message: 'Invalid JSON body.' }, { status: 400 });
  }

  const leadName = payload.name || payload.lead_name;
  const leadEmail = payload.email || payload.lead_email;
  const leadPhone = payload.phone || payload.lead_phone || '';
  const businessId = payload.business_id || payload.businessId || null;

  if (!leadName || !leadEmail) {
    return Response.json({ message: 'Name and email are required.' }, { status: 400 });
  }

  let createdLead = null;

  if (hasSupabaseConfig && supabase) {
    const { data, error } = await supabase
      .from('leads')
      .insert([
        {
          business_id: businessId,
          lead_name: leadName,
          lead_email: leadEmail,
          lead_phone: leadPhone,
          message: payload.message || '',
          status: 'New'
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase error inserting lead:', error);
      return Response.json({ message: 'Database submission failed: ' + error.message }, { status: 500 });
    }

    createdLead = data;
  } else {
    createdLead = {
      lead_name: payload.name,
      lead_email: payload.email,
      lead_phone: payload.phone || '',
      message: payload.message || ''
    };
  }

  // Trigger confirmation email sending (asynchronous)
  sendConfirmationEmail(payload.name, payload.email, payload.message);

  return Response.json({
    ok: true,
    message: 'Lead captured successfully and confirmation email sent.',
    lead: createdLead
  });
}