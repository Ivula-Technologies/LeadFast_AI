'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LEAD_STATUSES, type LeadStatus } from '@/lib/pipeline';

// A no-login tour of LeadFast with sample data. Nothing here touches the
// database or sends email; everything lives in this page's state.

const BUSINESS = 'Summit Roofing & Gutters';
const OWNER = 'Mike';
const SIGNUP = '/login?signup=1';

interface DemoLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  status: LeadStatus;
  jobValue: number | null;
  minutesAgo: number;
  replySeconds: number;
}

const SAMPLE_LEADS: DemoLead[] = [
  { id: 'l1', name: 'Jennifer Alvarez', email: 'jen.alvarez@example.com', phone: '(512) 555-0143', service: 'Roof repair', message: 'A few shingles blew off in last night\'s storm and there is a water stain on the bedroom ceiling. Can someone take a look this week?', status: 'New', jobValue: null, minutesAgo: 12, replySeconds: 34 },
  { id: 'l2', name: 'Marcus Reed', email: 'mreed@example.com', phone: '(512) 555-0188', service: 'Gutter cleaning', message: 'Two-story house, gutters overflowing in the back. Looking for a quote for cleaning and maybe guards.', status: 'Contacted', jobValue: null, minutesAgo: 95, replySeconds: 41 },
  { id: 'l3', name: 'Priya Natarajan', email: 'priya.n@example.com', phone: '(737) 555-0102', service: 'Roof inspection', message: 'We are closing on a house next month and the lender wants a roof inspection report.', status: 'Booked', jobValue: null, minutesAgo: 60 * 26, replySeconds: 29 },
  { id: 'l4', name: 'Tom Whitaker', email: 'twhitaker@example.com', phone: '(512) 555-0177', service: 'Full roof replacement', message: 'Roof is about 22 years old, 2,100 sq ft ranch. Want an estimate for architectural shingles.', status: 'Won', jobValue: 14800, minutesAgo: 60 * 24 * 4, replySeconds: 37 },
  { id: 'l5', name: 'Danielle Brooks', email: 'dbrooks@example.com', phone: '(737) 555-0121', service: 'Leak repair', message: 'Leak around the chimney flashing. Dripping when it rains hard.', status: 'Won', jobValue: 1250, minutesAgo: 60 * 24 * 6, replySeconds: 31 },
  { id: 'l6', name: 'Kevin O\'Neill', email: 'koneill@example.com', phone: '(512) 555-0190', service: 'Skylight', message: 'Want a price to replace an old skylight that fogs up.', status: 'Lost', jobValue: null, minutesAgo: 60 * 24 * 9, replySeconds: 44 },
];

const STATUS_STYLES: Record<LeadStatus, string> = {
  New: '!bg-amber-100 text-amber-800 !border-amber-300',
  Contacted: '!bg-sky-100 text-sky-800 !border-sky-300',
  Booked: '!bg-indigo-100 text-indigo-800 !border-indigo-300',
  Won: '!bg-emerald-100 text-emerald-800 !border-emerald-300',
  Lost: '!bg-slate-100 text-slate-600 !border-slate-300',
};

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function ago(minutes: number) {
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (minutes < 60 * 24) return `${Math.round(minutes / 60)} h ago`;
  const days = Math.round(minutes / (60 * 24));
  return days === 1 ? '1 day ago' : `${days} days ago`;
}

function sampleReply(name: string, service: string) {
  const first = name.trim().split(/\s+/)[0] || 'there';
  const job = service.trim().toLowerCase() || 'your project';
  return `Hi ${first},

Thanks for reaching out to ${BUSINESS} about ${job}. We got your request and ${OWNER} will call you shortly to talk through the details and set up a time to come out.

If anything is urgent, like an active leak, reply to this email or call us at (512) 555-0100 and we'll prioritize it.

Talk soon,
${OWNER}
${BUSINESS}`;
}

export default function DemoPage() {
  const [leads, setLeads] = useState<DemoLead[]>(SAMPLE_LEADS);
  const [filter, setFilter] = useState<'All' | LeadStatus>('All');
  const [form, setForm] = useState({ name: 'Sarah Kim', email: 'sarah.kim@example.com', service: 'Roof repair', message: 'Water is coming through the ceiling in the garage when it rains. How soon can you come out?' });
  const [phase, setPhase] = useState<'form' | 'sending' | 'replied'>('form');
  const [seconds, setSeconds] = useState(0);
  const [reply, setReply] = useState('');

  useEffect(() => {
    if (phase !== 'sending') return;
    const tick = setInterval(() => setSeconds((s) => s + 1), 60);
    const done = setTimeout(() => {
      clearInterval(tick);
      const replySeconds = 30 + Math.floor(Math.random() * 15);
      setSeconds(replySeconds);
      setReply(sampleReply(form.name, form.service));
      setLeads((all) => [
        { id: `new-${Date.now()}`, name: form.name.trim() || 'New customer', email: form.email.trim(), phone: '', service: form.service.trim(), message: form.message.trim(), status: 'New', jobValue: null, minutesAgo: 0, replySeconds },
        ...all,
      ]);
      setPhase('replied');
    }, 2200);
    return () => { clearInterval(tick); clearTimeout(done); };
  }, [phase, form]);

  function update(id: string, change: Partial<DemoLead>) {
    setLeads((all) => all.map((l) => (l.id === id ? { ...l, ...change } : l)));
  }

  const won = leads.filter((l) => l.status === 'Won');
  const wonRevenue = won.reduce((sum, l) => sum + (l.jobValue || 0), 0);
  const bookedOrWon = leads.filter((l) => l.status === 'Booked' || l.status === 'Won').length;
  const avgReply = Math.round(leads.reduce((sum, l) => sum + l.replySeconds, 0) / leads.length);
  const visible = filter === 'All' ? leads : leads.filter((l) => l.status === filter);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between text-sm">
          <p>
            <strong>Live demo.</strong> Sample data for a roofing company; nothing you do here is saved or emailed.
          </p>
          <div className="flex gap-3 items-center">
            <Link href="/" className="text-slate-300 hover:text-white">Home</Link>
            <Link href={SIGNUP} className="rounded-md bg-sky-500 px-3 py-1.5 font-semibold hover:bg-sky-400"
              style={{ color: '#fff' }}>
              Start free trial
            </Link>
          </div>
        </div>
      </div>

      <section className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6">
        <div>
          <p className="text-sky-700 text-xs font-semibold tracking-widest uppercase">Contractor dashboard</p>
          <h1 className="no-underline text-2xl sm:text-3xl font-bold">{BUSINESS}</h1>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Kpi label="Leads this month" value={String(leads.length)} />
          <Kpi label="Average reply time" value={`${avgReply} sec`} />
          <Kpi label="Booked or won" value={`${bookedOrWon}`} note={`${Math.round((bookedOrWon / leads.length) * 100)}% of leads`} />
          <Kpi label="Won from LeadFast leads" value={usd.format(wonRevenue)} note={`${won.length} ${won.length === 1 ? 'job' : 'jobs'}`} green />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Customer side */}
          <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
            <div>
              <h2 className="no-underline text-lg font-bold">Try it as the customer</h2>
              <p className="text-sm text-slate-600 mt-1">
                This is the quote form on the contractor&apos;s website or quote link. Send it and watch the reply arrive.
              </p>
            </div>

            {phase === 'form' && (
              <form
                className="space-y-3"
                onSubmit={(e) => { e.preventDefault(); setSeconds(0); setPhase('sending'); }}
              >
                <Field label="Your name">
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </Field>
                <Field label="Email">
                  <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </Field>
                <Field label="What do you need?">
                  <input required value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} />
                </Field>
                <Field label="Details">
                  <textarea rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                </Field>
                <button type="submit" className="shiny-btn w-full">Request a quote</button>
              </form>
            )}

            {phase === 'sending' && (
              <div className="rounded-xl border border-sky-200 bg-sky-50 p-5 text-center space-y-2">
                <div className="text-3xl font-bold text-sky-700 tabular-nums">{seconds}s</div>
                <p className="text-sm text-sky-900">Request received. LeadFast is writing the reply in {BUSINESS}&apos;s name…</p>
              </div>
            )}

            {phase === 'replied' && (
              <div className="space-y-3">
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <div className="bg-slate-100 px-4 py-2 text-xs text-slate-600 space-y-0.5">
                    <div><strong>From:</strong> {BUSINESS}</div>
                    <div><strong>To:</strong> {form.email}</div>
                    <div><strong>Subject:</strong> We got your request, {form.name.split(' ')[0]}</div>
                  </div>
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed p-4 text-slate-800">{reply}</pre>
                </div>
                <p className="text-sm text-emerald-700 font-medium">
                  Replied in {seconds} seconds. {OWNER} also got an email alert, and the lead is now at the top of the list.
                </p>
                <button type="button" data-plain="true" onClick={() => setPhase('form')} className="text-sm font-semibold text-sky-700 hover:underline">
                  Send another request
                </button>
              </div>
            )}
          </div>

          {/* Contractor side */}
          <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="no-underline text-lg font-bold">Incoming leads</h2>
                <p className="text-sm text-slate-600 mt-1">Move each lead along and record what you won.</p>
              </div>
              <select
                aria-label="Filter by status"
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'All' | LeadStatus)}
                className="sm:!w-40 text-sm"
              >
                <option value="All">All statuses</option>
                {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="space-y-3">
              {visible.length === 0 && <p className="text-sm text-slate-500 py-4">No leads with this status.</p>}
              {visible.map((lead) => (
                <div key={lead.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold">{lead.name}</div>
                      <div className="text-xs text-slate-500 truncate">
                        {lead.service} · {ago(lead.minutesAgo)} · replied in {lead.replySeconds}s
                      </div>
                    </div>
                    <select
                      aria-label={`Status for ${lead.name}`}
                      value={lead.status}
                      onChange={(e) => update(lead.id, { status: e.target.value as LeadStatus })}
                      className={`!w-auto !py-1 !px-2.5 !rounded-full text-xs font-semibold border ${STATUS_STYLES[lead.status]}`}
                    >
                      {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <p className="text-sm text-slate-700">{lead.message}</p>
                  {lead.status === 'Won' && (
                    <label className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-slate-700">Job value $</span>
                      <input
                        inputMode="decimal"
                        className="!w-32 !py-1.5"
                        value={lead.jobValue ?? ''}
                        placeholder="0"
                        onChange={(e) => {
                          const n = Number(e.target.value.replace(/[$,\s]/g, ''));
                          update(lead.id, { jobValue: e.target.value === '' || !Number.isFinite(n) ? null : n });
                        }}
                      />
                    </label>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-sky-700 text-white p-6 sm:p-8 text-center space-y-3">
          <h2 className="no-underline text-xl sm:text-2xl font-bold !text-white" style={{ WebkitTextFillColor: '#fff' }}>
            Want this answering your leads tonight?
          </h2>
          <p className="text-sky-100">14-day free trial. No credit card. Works with your website or a quote link you share anywhere.</p>
          <Link href={SIGNUP} className="inline-block rounded-lg bg-white px-6 py-3 font-semibold hover:bg-sky-50"
            style={{ color: '#075985' }}>
            Start your free trial
          </Link>
        </div>
      </section>
    </main>
  );
}

function Kpi({ label, value, note, green }: { label: string; value: string; note?: string; green?: boolean }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs sm:text-sm text-slate-600">{label}</div>
      <div className={`text-xl sm:text-2xl font-bold mt-1 ${green ? 'text-emerald-700' : 'text-slate-900'}`}>{value}</div>
      {note && <div className="text-xs text-slate-500 mt-0.5">{note}</div>}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-slate-700 space-y-1">
      <span>{label}</span>
      {children}
    </label>
  );
}
