'use client';

import { useEffect, useState } from 'react';
import { useTypewriter } from '../hooks/useTypewriter';
import { useRouter } from 'next/navigation';
import LogoutButton from '../components/LogoutButton';
import BillingPanel from '../components/BillingPanel';
import InstallAppCard from '../components/InstallAppCard';
import LeadAlertsCard from '../components/LeadAlertsCard';
import { supabaseAnon as supabase, hasSupabaseConfig } from '@/lib/supabase';
import { authHeaders } from '@/lib/session';
import { BOOKING_URL } from '@/lib/booking';
import { LEAD_STATUSES, normalizeStatus, type LeadStatus } from '@/lib/pipeline';

interface Business {
  id: string;
  business_name: string;
  trade: string | null;
  contact_email: string | null;
  contact_phone: string | null;
}

interface Lead {
  id: string;
  lead_name: string;
  lead_email: string | null;
  lead_phone: string | null;
  message: string | null;
  status: string;
  job_value: number | string | null;
  created_at: string;
}

const STATUS_STYLES: Record<LeadStatus, string> = {
  New: '!bg-amber-100 text-amber-800 !border-amber-300',
  Contacted: '!bg-sky-100 text-sky-800 !border-sky-300',
  Booked: '!bg-indigo-100 text-indigo-800 !border-indigo-300',
  Won: '!bg-emerald-100 text-emerald-800 !border-emerald-300',
  Lost: '!bg-slate-100 text-slate-600 !border-slate-300',
};

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export default function ContractorDashboard() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [copied, setCopied] = useState(false);
  const [copiedUuid, setCopiedUuid] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [testState, setTestState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [leadError, setLeadError] = useState('');
  const [jobValues, setJobValues] = useState<Record<string, string>>({});
  
  // Onboarding Modal State
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [platformTab, setPlatformTab] = useState<'html' | 'wordpress' | 'wix'>('html');
  const [copiedModalSnippet, setCopiedModalSnippet] = useState(false);

  const router = useRouter();

  useEffect(() => {
    async function loadContractorData() {
      if (typeof window === 'undefined') return;

      const storedBusiness = window.localStorage.getItem('hvap-business');

      const { data: sessionData } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
      if (!sessionData.session) {
        router.replace('/login');
        return;
      }

      let currentBiz: Business | null = null;
      if (storedBusiness) {
        try {
          currentBiz = JSON.parse(storedBusiness);
        } catch (e) {
          console.error('Error parsing stored business:', e);
        }
      }

      setBusiness(currentBiz);


      if (hasSupabaseConfig && supabase) {
        try {
          if (currentBiz && currentBiz.id) {
            const { data, error } = await supabase
              .from('leads')
              .select('*')
              .eq('business_id', currentBiz.id)
              .order('created_at', { ascending: false });

            if (error) {
              console.error('Error fetching leads:', error);
            } else if (data) {
              setLeads(data as Lead[]);
            }
          } else {
            setLeads([]);
          }
        } catch (err) {
          console.error('Fetch error:', err);
        }
      }

      setLoading(false);
    }

    loadContractorData();
  }, [router]);

  function closeOnboarding() {
    setShowOnboarding(false);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('hvap-onboarded', 'true');
    }
  }

  async function reloadLeads() {
    if (!supabase || !business?.id) return;
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false });
    if (!error && data) setLeads(data as Lead[]);
  }

  async function updateLead(id: string, change: { status?: LeadStatus; job_value?: number | null }) {
    setLeadError('');
    const previous = leads;
    setLeads((all) => all.map((l) => (l.id === id ? { ...l, ...change } : l)));
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
        body: JSON.stringify(change),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Could not update the lead.');
      setLeads((all) => all.map((l) => (l.id === id ? (data.data as Lead) : l)));
    } catch (err) {
      setLeads(previous);
      setLeadError(err instanceof Error ? err.message : 'Could not update the lead.');
    }
  }

  function saveJobValue(lead: Lead) {
    const raw = jobValues[lead.id];
    if (raw === undefined) return;
    const cleaned = raw.replace(/[$,\s]/g, '');
    const value = cleaned === '' ? null : Number(cleaned);
    if (value !== null && (!Number.isFinite(value) || value < 0)) {
      setLeadError('Enter the job value as a dollar amount, like 1250.');
      return;
    }
    if (value === (lead.job_value === null ? null : Number(lead.job_value))) return;
    updateLead(lead.id, { job_value: value });
  }

  async function sendTestLead() {
    if (!business?.id) return;
    setTestState('sending');
    setTestMessage('');
    try {
      const res = await fetch('/api/leads/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
        body: JSON.stringify({ business_id: business.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Could not send the test lead.');
      setTestState('sent');
      setTestMessage('Test lead sent. Check your inbox: the instant reply your customers get and your new-lead alert are on their way.');
      // The reply is written after the response, so give it a moment before refreshing.
      setTimeout(() => { reloadLeads(); }, 2500);
    } catch (err) {
      setTestState('idle');
      setTestMessage(err instanceof Error ? err.message : 'Could not send the test lead.');
    }
  }

  function getQuoteLink() {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return business?.id ? `${origin}/q/${business.id}` : '';
  }

  function getEmbedSnippet() {
    const businessId = business?.id || 'YOUR_BUSINESS_ID';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `<script\n  src="${origin}/embed.js"\n  data-business-id="${businessId}"\n  async>\n</script>`;
  }

  const visibleLeads = filterStatus === 'All'
    ? leads
    : leads.filter(l => normalizeStatus(l.status) === filterStatus);

  const wonLeads = leads.filter((l) => normalizeStatus(l.status) === 'Won');
  const wonRevenue = wonLeads.reduce((sum, l) => sum + (Number(l.job_value) || 0), 0);
  const bookedOrWon = leads.filter((l) => ['Booked', 'Won'].includes(normalizeStatus(l.status))).length;

  // Derive a stable title string for the typewriter
  const dashboardTitle = business?.business_name || 'Contractor Dashboard';

  const [animatedTitle, titleDone] = useTypewriter(dashboardTitle, 60, 300);

  return (
    <main
      className="min-h-screen text-[#0f172a] px-4 py-6 sm:px-6 lg:px-8"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(248, 250, 252, 0.60), rgba(241, 245, 249, 0.72)), url('/images/appliance.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <section className="max-w-7xl mx-auto space-y-6">
        
        {/* Header + Nav */}
        <div className="panel card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 sm:p-6 rounded-2xl bg-white/95 border border-slate-200 shadow-lg">
          <div>
            <p className="text-[#0284c7] text-xs font-semibold tracking-widest uppercase mb-1">
              Private Contractor Workspace
            </p>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight" style={{ minHeight: '1.3em' }}>
              {animatedTitle}
              <span style={{ display: 'inline-block', width: '2px', height: '0.8em', background: '#0284c7', marginLeft: '3px', verticalAlign: 'middle', borderRadius: '2px', opacity: titleDone ? 0 : 1, animation: titleDone ? 'none' : 'blink 0.9s step-end infinite', transition: 'opacity 0.4s ease' }} />
            </h1>
            <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
          </div>
          <nav className="flex items-center gap-2 sm:gap-3 flex-wrap w-full sm:w-auto justify-start sm:justify-end [&_button]:!px-3.5 [&_button]:!py-2 [&_button]:!text-xs sm:[&_button]:!text-sm">
            <a
              href="/settings"
              className="px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200 transition-all"
            >
              ⚙️ Settings
            </a>
            <button
              type="button"
              onClick={() => { setOnboardingStep(1); setShowOnboarding(true); }}
              className="px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-full bg-sky-50 text-sky-700 border border-sky-300 hover:bg-sky-100 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>🚀 Setup Walkthrough</span>
            </button>
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-full bg-sky-50 text-sky-700 border border-sky-300 hover:bg-sky-100 transition-all"
            >
              📅 Book a help call
            </a>
            <LogoutButton />
          </nav>
        </div>

        {/* Business Summary KPI */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="panel card kpi p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50/50 border border-slate-200">
            <div className="label text-slate-600 text-xs sm:text-sm font-medium">Registered Trade</div>
            <div className="value text-lg sm:text-xl font-bold text-slate-900 mt-1 capitalize">
              {business?.trade || 'General Contracting'}
            </div>
          </div>

          <div className="panel card kpi p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50/50 border border-slate-200">
            <div className="label text-slate-600 text-xs sm:text-sm font-medium">Total Captured Leads</div>
            <div className="value text-2xl font-bold text-slate-900 mt-1">
              {loading ? '—' : leads.length}
            </div>
          </div>

          <div className="panel card kpi p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50/50 border border-slate-200">
            <div className="label text-slate-600 text-xs sm:text-sm font-medium">Booked or Won</div>
            <div className="value text-2xl font-bold text-slate-900 mt-1">
              {loading ? '—' : bookedOrWon}
              {!loading && leads.length > 0 && (
                <span className="text-sm font-semibold text-slate-500 ml-2">
                  {Math.round((bookedOrWon / leads.length) * 100)}%
                </span>
              )}
            </div>
          </div>

          <div className="panel card kpi p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50/50 border border-slate-200">
            <div className="label text-slate-600 text-xs sm:text-sm font-medium">Won from LeadFast Leads</div>
            <div className="value text-2xl font-bold text-emerald-700 mt-1">
              {loading ? '—' : usd.format(wonRevenue)}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {wonLeads.length} {wonLeads.length === 1 ? 'job' : 'jobs'} marked Won
            </div>
          </div>
        </div>

        <InstallAppCard />

        {business?.id && <LeadAlertsCard businessId={business.id} />}

        {business?.id && <BillingPanel businessId={business.id} />}

        {/* Quote link + test lead: the fastest way to a first lead */}
        {business?.id && (
          <div className="panel card p-5 sm:p-6 rounded-2xl bg-white/95 border border-slate-200 shadow-lg space-y-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold" style={{ color: '#0284c7' }}>
                {leads.length === 0 ? 'Get your first lead in 2 minutes' : 'Your quote request link'}
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm mt-1">
                No website needed. Share this link on your Google Business Profile, Facebook page, Instagram bio, Yelp, Nextdoor or in a text.
                Every request gets an instant reply and lands here.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                readOnly
                value={getQuoteLink()}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                aria-label="Your quote request link"
                className="flex-1 font-mono text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sky-800 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(getQuoteLink());
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2500);
                }}
                className={`w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl text-white transition cursor-pointer ${copiedLink ? 'bg-emerald-600' : 'shiny-btn'}`}
              >
                {copiedLink ? '✓ Link Copied!' : '🔗 Copy Link'}
              </button>
              <a
                href={getQuoteLink()}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200 transition text-center"
              >
                Preview
              </a>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1 border-t border-slate-100">
              <button
                type="button"
                disabled={testState === 'sending'}
                onClick={sendTestLead}
                className="w-full sm:w-auto mt-3 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-sky-50 text-sky-700 border border-sky-300 hover:bg-sky-100 transition cursor-pointer disabled:opacity-60"
              >
                {testState === 'sending' ? 'Sending…' : '✉️ Send Myself a Test Lead'}
              </button>
              <p className={`text-xs sm:text-sm sm:mt-3 ${testState === 'sent' ? 'text-emerald-700' : testMessage ? 'text-red-600' : 'text-slate-500'}`}>
                {testMessage || 'See exactly what your customers receive. A test uses one instant reply from your allowance.'}
              </p>
            </div>
          </div>
        )}

        {/* Contractor's Private Leads View */}
        <div className="panel card p-5 sm:p-6 rounded-2xl bg-white/95 border border-slate-200 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold" style={{ color: '#0284c7' }}>My Incoming Leads</h2>
              <p className="text-slate-600 text-xs sm:text-sm mt-0.5">Customer requests submitted for your services.</p>
            </div>
            {leads.length > 0 && (
              <select
                aria-label="Filter status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs sm:text-sm focus:outline-none focus:border-sky-500"
              >
                <option value="All">All statuses</option>
                {LEAD_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            )}
          </div>

          {leadError && <p className="text-sm text-red-600">{leadError}</p>}

          {loading ? (
            <p className="text-slate-600 text-sm py-4">Loading your leads...</p>
          ) : visibleLeads.length === 0 ? (
            <div className="p-8 sm:p-12 text-center border border-dashed border-slate-300 rounded-2xl bg-slate-50/60">
              <p className="text-base sm:text-lg font-medium text-slate-700">
                No leads captured yet.
              </p>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-md mx-auto">
                Share your quote link or embed the script on your website, and new enquiries will appear here.
              </p>
              <button
                type="button"
                onClick={() => { setOnboardingStep(1); setShowOnboarding(true); }}
                className="mt-4 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-sky-50 text-sky-700 border border-sky-300 hover:bg-sky-100 transition cursor-pointer"
              >
                🚀 Launch Installation Guide
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {visibleLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/80 hover:border-slate-300 transition space-y-3"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0">
                      <div className="font-bold text-base sm:text-lg text-slate-900">{lead.lead_name}</div>
                      <div className="text-sky-700 text-xs sm:text-sm mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span>📧 {lead.lead_email || 'No email'}</span>
                        {lead.lead_phone && <span>• 📞 {lead.lead_phone}</span>}
                      </div>
                    </div>
                    <select
                      aria-label={`Status for ${lead.lead_name}`}
                      value={normalizeStatus(lead.status)}
                      onChange={(e) => updateLead(lead.id, { status: e.target.value as LeadStatus })}
                      className={`!w-auto !px-3 !py-1 !rounded-full text-xs font-semibold border cursor-pointer focus:outline-none ${STATUS_STYLES[normalizeStatus(lead.status)]}`}
                    >
                      {LEAD_STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  {normalizeStatus(lead.status) === 'Won' && (
                    <label className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
                      <span className="font-medium">Job value</span>
                      <span className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                        <input
                          inputMode="decimal"
                          placeholder="0"
                          value={jobValues[lead.id] ?? (lead.job_value === null ? '' : String(Number(lead.job_value)))}
                          onChange={(e) => setJobValues((v) => ({ ...v, [lead.id]: e.target.value }))}
                          onBlur={() => saveJobValue(lead)}
                          onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                          className="!w-32 !pl-6 !pr-2.5 !py-1.5 rounded-lg bg-white border border-slate-300 focus:outline-none focus:border-emerald-500"
                        />
                      </span>
                    </label>
                  )}

                  {lead.message && (
                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                      <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">{lead.message}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    {lead.lead_phone && (
                      <a href={`tel:${lead.lead_phone.replace(/[^\d+]/g, '')}`} className="px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-500" style={{ color: '#fff' }}>
                        📞 Call
                      </a>
                    )}
                    {lead.lead_phone && (
                      <a href={`sms:${lead.lead_phone.replace(/[^\d+]/g, '')}`} className="px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50">
                        💬 Text
                      </a>
                    )}
                    {lead.lead_email && (
                      <a href={`mailto:${lead.lead_email}`} className="px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50">
                        ✉️ Email
                      </a>
                    )}
                    <span className="text-slate-500 text-xs ml-auto">
                      {new Date(lead.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Embed Widget Code Snippet Section */}
        <div className="panel card p-5 sm:p-6 rounded-2xl bg-white/95 border border-slate-200 shadow-lg space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2" style={{ color: '#0284c7' }}>
                <span>⚡</span> Website Embed Code & Business ID
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm mt-1">
                Copy your script tag or share your Business UUID (<code className="text-sky-700 font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">{business?.id || 'N/A'}</code>) with clients to receive direct targeted leads.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto">
              <button
                type="button"
                onClick={() => {
                  setOnboardingStep(1);
                  setShowOnboarding(true);
                }}
                className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200 transition cursor-pointer text-center"
              >
                📖 View Setup Guide
              </button>
              <button
                type="button"
                onClick={() => {
                  if (business?.id) {
                    navigator.clipboard.writeText(business.id);
                    setCopiedUuid(true);
                    setTimeout(() => setCopiedUuid(false), 2500);
                  }
                }}
                className={`w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition cursor-pointer ${
                  copiedUuid 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-sky-50 text-sky-700 border border-sky-300 hover:bg-sky-100'
                }`}
              >
                {copiedUuid ? '✓ UUID Copied!' : '🆔 Copy Business UUID'}
              </button>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(getEmbedSnippet());
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2500);
                }}
                className={`w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl text-white transition cursor-pointer shadow-md ${
                  copied 
                    ? 'bg-emerald-600' 
                    : 'shiny-btn'
                }`}
              >
                {copied ? '✓ Snippet Copied!' : '📋 Copy Embed Code'}
              </button>
            </div>
          </div>

          <textarea
            readOnly
            rows={4}
            value={getEmbedSnippet()}
            className="w-full font-mono text-xs sm:text-sm p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sky-800 focus:outline-none resize-y overflow-x-auto"
            onClick={(e) => (e.target as HTMLTextAreaElement).select()}
          />
        </div>

      </section>

      {/* TASK 2: ONBOARDING / SETUP WALKTHROUGH MODAL */}
      {showOnboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8 text-slate-900">
            
            {/* Header with Close button */}
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">⚡</span>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold" style={{ color: '#0284c7' }}>Contractor Setup Walkthrough</h3>
                  <p className="text-xs sm:text-sm text-sky-700 font-semibold">Step {onboardingStep} of 3</p>
                </div>
              </div>
              <button
                type="button"
                data-plain="true"
                onClick={closeOnboarding}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center justify-center transition cursor-pointer text-base"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Progress Stepper Bar */}
            <div className="grid grid-cols-3 gap-2">
              <div className={`h-1.5 rounded-full transition-all ${onboardingStep >= 1 ? 'bg-sky-500' : 'bg-slate-200'}`} />
              <div className={`h-1.5 rounded-full transition-all ${onboardingStep >= 2 ? 'bg-sky-500' : 'bg-slate-200'}`} />
              <div className={`h-1.5 rounded-full transition-all ${onboardingStep >= 3 ? 'bg-sky-500' : 'bg-slate-200'}`} />
            </div>

            {/* STEP 1: Copy Embed Snippet */}
            {onboardingStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <h4 className="text-base sm:text-lg font-semibold flex items-center gap-2" style={{ color: '#0f172a' }}>
                    <span>1️⃣</span> Copy Your Unique Vanilla JS Script Snippet
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    LeadFast AI provides a lightweight JavaScript snippet that captures leads directly from your website forms. Your snippet includes your unique Business ID (<code className="text-sky-700 font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">{business?.id || 'YOUR_BUSINESS_ID'}</code>).
                  </p>
                </div>

                <div className="relative group">
                  <pre className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sky-900 font-mono text-xs overflow-x-auto leading-relaxed">
                    {getEmbedSnippet()}
                  </pre>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(getEmbedSnippet());
                      setCopiedModalSnippet(true);
                      setTimeout(() => setCopiedModalSnippet(false), 2500);
                    }}
                    className={`mt-2 sm:absolute sm:top-3 sm:right-3 px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                      copiedModalSnippet 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-sky-600 text-white hover:bg-sky-500'
                    }`}
                  >
                    {copiedModalSnippet ? '✓ Copied!' : '📋 Copy Script Code'}
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-900 flex items-start gap-2">
                  <span className="text-base">💡</span>
                  <span>
                    <strong>Why Vanilla JS?</strong> This script runs seamlessly on any website platform (WordPress, Squarespace, Wix, Webflow, or HTML) without slowing down page load speeds.
                  </span>
                </div>
              </div>
            )}

            {/* STEP 2: Paste Snippet into Website */}
            {onboardingStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <h4 className="text-base sm:text-lg font-semibold flex items-center gap-2" style={{ color: '#0f172a' }}>
                    <span>2️⃣</span> Paste the Script into Your Website
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Select your website builder or platform below to see specific instructions on where to paste your snippet.
                  </p>
                </div>

                {/* Platform Selector Tabs */}
                <div className="flex gap-2 border-b border-slate-200 pb-2">
                  <button
                    type="button"
                    onClick={() => setPlatformTab('html')}
                    className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer ${
                      platformTab === 'html' ? 'bg-sky-100 text-sky-800 border border-sky-300' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🌐 HTML / Custom Code
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlatformTab('wordpress')}
                    className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer ${
                      platformTab === 'wordpress' ? 'bg-sky-100 text-sky-800 border border-sky-300' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    📝 WordPress
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlatformTab('wix')}
                    className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer ${
                      platformTab === 'wix' ? 'bg-sky-100 text-sky-800 border border-sky-300' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🎨 Wix / Squarespace / Webflow
                  </button>
                </div>

                {/* Platform Content */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs sm:text-sm text-slate-700">
                  {platformTab === 'html' && (
                    <ol className="list-decimal list-inside space-y-2 text-slate-700">
                      <li>Open your website&apos;s main HTML file (e.g. <code className="text-sky-800 font-mono">index.html</code>).</li>
                      <li>Scroll to the bottom of the file right before the closing <code className="text-sky-800 font-mono">&lt;/body&gt;</code> tag.</li>
                      <li>Paste the copied <code className="text-sky-800 font-mono">&lt;script&gt;</code> snippet and save the file.</li>
                    </ol>
                  )}

                  {platformTab === 'wordpress' && (
                    <ol className="list-decimal list-inside space-y-2 text-slate-700">
                      <li>Log into your WordPress Dashboard.</li>
                      <li>Go to <strong>Plugins → Add New</strong> and search for <em>&quot;Header and Footer Scripts&quot;</em> or <em>&quot;WPCode&quot;</em>.</li>
                      <li>Paste the script snippet into the <strong>Footer Scripts</strong> box and click <strong>Save Changes</strong>.</li>
                    </ol>
                  )}

                  {platformTab === 'wix' && (
                    <ol className="list-decimal list-inside space-y-2 text-slate-700">
                      <li>In your site builder dashboard, navigate to <strong>Settings → Custom Code</strong> or <strong>Embed HTML</strong>.</li>
                      <li>Add a new Custom Code snippet and choose <strong>Body - End</strong> placement.</li>
                      <li>Paste your LeadFast AI script and click <strong>Apply / Publish</strong>.</li>
                    </ol>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: Verify & Test Lead Capture */}
            {onboardingStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <h4 className="text-base sm:text-lg font-semibold flex items-center gap-2" style={{ color: '#0f172a' }}>
                    <span>3️⃣</span> Test & Verify Lead Capture
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    You&apos;re all set! Once the snippet is installed on your site, any quote request or form submission made by a client will be processed instantly by LeadFast AI.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="text-sky-700 font-bold text-sm">⚡ Instant AI Email Reply</div>
                    <p className="text-slate-600 text-xs">
                      The client receives an immediate context-aware email response with job details within 30 seconds.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="text-emerald-700 font-bold text-sm">📊 Live Dashboard Sync</div>
                    <p className="text-slate-600 text-xs">
                      All prospective customer details are logged automatically right here under <strong>My Incoming Leads</strong>.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <span>✅</span>
                  <span>Setup complete! You can reopen this guide anytime from your dashboard header.</span>
                </div>
              </div>
            )}

            {/* Modal Controls / Footer */}
            <div className="flex justify-between items-center border-t border-slate-200 pt-4">
              {onboardingStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setOnboardingStep(s => s - 1)}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition cursor-pointer"
                >
                  ← Back
                </button>
              ) : (
                <div />
              )}

              {onboardingStep < 3 ? (
                <button
                  type="button"
                  onClick={() => setOnboardingStep(s => s + 1)}
                  className="px-5 py-2 text-xs sm:text-sm font-semibold rounded-xl shiny-btn text-white transition cursor-pointer"
                >
                  Next Step →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={closeOnboarding}
                  className="px-5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition cursor-pointer"
                >
                  Finish & Go to Dashboard ✓
                </button>
              )}
            </div>

          </div>
        </div>
        
      )}
    </main>
  );
}
