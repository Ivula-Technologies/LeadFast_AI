import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import QuoteForm from "./QuoteForm";

// Hosted quote request page: a link contractors can share anywhere (Google
// Business Profile, Facebook, Instagram bio, Yelp, text replies) when they
// don't have a website form to put embed.js on.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface PublicBusiness {
  id: string;
  business_name: string;
  trade: string | null;
  contact_phone: string | null;
}

async function loadBusiness(businessId: string): Promise<PublicBusiness | null> {
  if (!supabase || !UUID_RE.test(businessId)) return null;
  const { data } = await supabase
    .from("businesses")
    .select("id, business_name, trade, contact_phone")
    .eq("id", businessId)
    .maybeSingle<PublicBusiness>();
  return data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ businessId: string }>;
}): Promise<Metadata> {
  const business = await loadBusiness((await params).businessId);
  if (!business) return { title: "Request a quote" };
  const title = `Request a quote from ${business.business_name}`;
  const description = `Tell ${business.business_name} what you need${
    business.trade ? ` (${business.trade})` : ""
  } and get a reply right away.`;
  return { title, description, openGraph: { title, description } };
}

export default async function QuotePage({ params }: { params: Promise<{ businessId: string }> }) {
  const business = await loadBusiness((await params).businessId);
  if (!business) notFound();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:py-16 text-slate-900">
      <div className="max-w-lg mx-auto space-y-6">
        <header className="text-center space-y-2">
          {business.trade && (
            <p className="text-xs font-semibold tracking-widest uppercase text-sky-700">{business.trade}</p>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{business.business_name}</h1>
          <p className="text-slate-600 text-sm sm:text-base">
            Tell us what you need and we&apos;ll get back to you right away.
          </p>
          {business.contact_phone && (
            <p className="text-sm text-slate-600">
              Urgent?{" "}
              <a className="font-semibold text-sky-700" href={`tel:${business.contact_phone.replace(/[^\d+]/g, "")}`}>
                Call {business.contact_phone}
              </a>
            </p>
          )}
        </header>

        <QuoteForm businessId={business.id} businessName={business.business_name} />

        <p className="text-center text-xs text-slate-500">
          Powered by{" "}
          <Link href="/" className="font-semibold text-slate-600">
            LeadFast AI
          </Link>
        </p>
      </div>
    </main>
  );
}
