'use client';

import { useState } from 'react';

export default function QuoteForm({ businessId, businessName }: { businessId: string; businessName: string }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '', lf_hp: '' });
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    if (!form.email && !form.phone) {
      setError('Please add an email address or phone number so we can reach you.');
      return;
    }
    setState('sending');
    try {
      const res = await fetch('/api/lead-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, business_id: businessId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Something went wrong. Please try again.');
      setState('sent');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setState('idle');
    }
  }

  if (state === 'sent') {
    return (
      <div className="rounded-2xl bg-white border border-emerald-200 p-6 text-center space-y-2 shadow-sm">
        <p className="text-lg font-bold text-emerald-700">Thanks, your request is in.</p>
        <p className="text-sm text-slate-600">
          {form.email
            ? `${businessName} will be in touch shortly. Check your inbox for a reply.`
            : `${businessName} will call or text you shortly.`}
        </p>
      </div>
    );
  }

  const input =
    'w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-sky-500';

  return (
    <form onSubmit={submit} className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 space-y-4 shadow-sm">
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-slate-700">Your name</span>
        <input required maxLength={120} autoComplete="name" value={form.name} onChange={set('name')} className={input} />
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input type="email" maxLength={254} autoComplete="email" value={form.email} onChange={set('email')} className={input} />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Phone</span>
          <input type="tel" maxLength={40} autoComplete="tel" value={form.phone} onChange={set('phone')} className={input} />
        </label>
      </div>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-slate-700">What do you need help with?</span>
        <textarea
          required
          rows={5}
          maxLength={5000}
          value={form.message}
          onChange={set('message')}
          placeholder="For example: water heater leaking in the garage, would like someone out this week."
          className={input}
        />
      </label>
      {/* Honeypot: hidden from people, filled in by bots. */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={form.lf_hp}
        onChange={set('lf_hp')}
        style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={state === 'sending'} className="w-full shiny-btn disabled:opacity-60">
        {state === 'sending' ? 'Sending…' : 'Request a quote'}
      </button>
    </form>
  );
}
