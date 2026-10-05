'use client';

import { useEffect, useState } from 'react';
import { useTypewriter } from '../hooks/useTypewriter';
import { useRouter } from 'next/navigation';
import LogoutButton from '../components/LogoutButton';
import { supabaseAnon as supabase, hasSupabaseConfig } from '@/lib/supabase';
import { authHeaders } from '@/lib/session';

export default function SettingsPage() {
  const router = useRouter();
  const [settingsTitle, settingsDone] = useTypewriter('Settings', 80, 300);

  const [businessId, setBusinessId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState('');

  const [businessName, setBusinessName] = useState('');
  const [trade, setTrade] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const [creatingBiz, setCreatingBiz] = useState(false);
  const [createMessage, setCreateMessage] = useState('');
  const [newBizName, setNewBizName] = useState('');
  const [newBizTrade, setNewBizTrade] = useState('');
  const [newBizEmail, setNewBizEmail] = useState('');
  const [newBizPhone, setNewBizPhone] = useState('');

  useEffect(() => {
    async function load() {
      if (typeof window === 'undefined') return;

      const storedBusiness = window.localStorage.getItem('hvap-business');

      const { data: sessionData } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
      if (!sessionData.session) {
        router.replace('/login');
        return;
      }

      let cachedId: string | null = null;
      if (storedBusiness) {
        try {
          cachedId = JSON.parse(storedBusiness).id;
        } catch (e) {
          console.error('Error parsing stored business:', e);
        }
      }

      if (!cachedId || !hasSupabaseConfig || !supabase) {
        setLoading(false);
        return;
      }

      setBusinessId(cachedId);

      // Fetch the full, current record - the cached business in
      // localStorage only holds { id, name }, not enough to edit.
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', cachedId)
        .single();

      if (error) {
        console.error('Error loading business:', error);
      } else if (data) {
        setBusinessName(data.business_name || '');
        setTrade(data.trade || '');
        setContactEmail(data.contact_email || '');
        setContactPhone(data.contact_phone || '');
      }

      setLoading(false);
    }

    load();
  }, [router]);

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    if (!businessId || !supabase) return;
    setSaving(true);
    setMessage('');

    const { error } = await supabase
      .from('businesses')
      .update({
        business_name: businessName,
        trade,
        contact_email: contactEmail,
        contact_phone: contactPhone,
      })
      .eq('id', businessId);

    if (error) {
      setMessage(`Failed to save: ${error.message}`);
    } else {
      // Keep the cached id/name pair in sync so the dashboard header
      // reflects a renamed business without needing to log in again.
      window.localStorage.setItem('hvap-business', JSON.stringify({ id: businessId, name: businessName }));
      setMessage('Business information updated successfully.');
    }
    setSaving(false);
  }

  async function handleCreateBusiness(event: React.FormEvent) {
    event.preventDefault();
    if (typeof window === 'undefined') return;

    setCreatingBiz(true);
    setCreateMessage('');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
        body: JSON.stringify({
          business_name: newBizName,
          trade: newBizTrade,
          contact_email: newBizEmail,
          contact_phone: newBizPhone,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to create business.');

      // Switch the active business context to the one just created,
      // the same way login already does after sign-in.
      window.localStorage.setItem('hvap-business', JSON.stringify({ id: result.id, name: result.business_name }));
      router.replace('/dashboard');
    } catch (err) {
      setCreateMessage(`Failed to create business: ${err instanceof Error ? err.message : 'unknown error'}`);
      setCreatingBiz(false);
    }
  }

  async function handleDelete() {
    if (!businessId || !supabase) return;
    setDeleting(true);
    setMessage('');

    const { error } = await supabase.from('businesses').delete().eq('id', businessId);

    if (error) {
      setMessage(`Failed to delete: ${error.message}`);
      setDeleting(false);
      return;
    }

    window.localStorage.removeItem('hvap-business');
    window.localStorage.removeItem('hvap-onboarded');
    router.replace('/login');
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f1f5f9]">
        <div className="w-9 h-9 rounded-full border-[3px] border-slate-300 border-t-sky-500 animate-spin" role="status" aria-label="Loading" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f1f5f9] text-[#0f172a] px-4 py-6 sm:px-6 lg:px-8">
      <section className="max-w-3xl mx-auto space-y-6">

        {/* Header + Nav */}
        <div className="panel card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-md">
          <div>
            <p className="text-[#0284c7] text-xs font-semibold tracking-widest uppercase mb-1">Account</p>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0f172a] tracking-tight" style={{ minHeight: '1.3em' }}>
              {settingsTitle}
              <span style={{ display: 'inline-block', width: '2px', height: '0.8em', background: '#0284c7', marginLeft: '3px', verticalAlign: 'middle', borderRadius: '2px', opacity: settingsDone ? 0 : 1, animation: settingsDone ? 'none' : 'blink 0.9s step-end infinite', transition: 'opacity 0.4s ease' }} />
            </h1>
            <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
          </div>
          <nav className="flex items-center gap-3 flex-wrap w-full sm:w-auto justify-start sm:justify-end">
            <a
              href="/dashboard"
              className="px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition-all"
            >
              ← Dashboard
            </a>
            <LogoutButton />
          </nav>
        </div>

        {!businessId ? (
          <div className="panel card p-6 rounded-2xl bg-white border border-slate-200">
            <p className="text-slate-500">No business is linked to this account yet.</p>
          </div>
        ) : (
          <>
            {/* Update business information */}
            <div className="panel card p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-md">
              <h2 className="text-lg font-bold mb-1 text-[#0f172a]">Business Information</h2>
              <p className="text-slate-500 text-sm mb-5">Update your business details, contact email, and phone number.</p>

              <form onSubmit={handleSave} className="grid gap-4">
                <label className="grid gap-1.5">
                  <span className="text-sm text-slate-600">Business Name</span>
                  <input
                    required
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Acme Plumbing Co."
                  />
                </label>

                <label className="grid gap-1.5">
                  <span className="text-sm text-slate-600">Trade</span>
                  <input
                    type="text"
                    value={trade}
                    onChange={(e) => setTrade(e.target.value)}
                    placeholder="e.g. Plumbing, HVAC, Electrical"
                  />
                </label>

                <label className="grid gap-1.5">
                  <span className="text-sm text-slate-600">Contact Email</span>
                  <input
                    required
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="info@acme.com"
                  />
                </label>

                <label className="grid gap-1.5">
                  <span className="text-sm text-slate-600">Contact Phone</span>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+1 555 1234"
                  />
                </label>

                <button
                  type="submit"
                  disabled={saving}
                  className="justify-self-start px-5 py-2.5 text-sm font-semibold rounded-xl shiny-btn text-white transition cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>

                {message && (
                  <p role="alert" className={`text-sm ${message.startsWith('Failed') ? 'text-red-600' : 'text-green-600'}`}>
                    {message}
                  </p>
                )}
              </form>
            </div>

            {/* Add another business */}
            <div className="panel card p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-md">
              <h2 className="text-lg font-bold mb-1 text-[#0f172a]">Add Another Business</h2>
              <p className="text-slate-500 text-sm mb-5">
                Your account can own more than one business. Creating a new one switches your active dashboard to it.
              </p>

              <form onSubmit={handleCreateBusiness} className="grid gap-4">
                <label className="grid gap-1.5">
                  <span className="text-sm text-slate-600">Business Name</span>
                  <input
                    required
                    type="text"
                    value={newBizName}
                    onChange={(e) => setNewBizName(e.target.value)}
                    placeholder="Second Business LLC"
                  />
                </label>

                <label className="grid gap-1.5">
                  <span className="text-sm text-slate-600">Trade</span>
                  <input
                    type="text"
                    value={newBizTrade}
                    onChange={(e) => setNewBizTrade(e.target.value)}
                    placeholder="e.g. Plumbing, HVAC, Electrical"
                  />
                </label>

                <label className="grid gap-1.5">
                  <span className="text-sm text-slate-600">Contact Email</span>
                  <input
                    required
                    type="email"
                    value={newBizEmail}
                    onChange={(e) => setNewBizEmail(e.target.value)}
                    placeholder="info@secondbusiness.com"
                  />
                </label>

                <label className="grid gap-1.5">
                  <span className="text-sm text-slate-600">Contact Phone</span>
                  <input
                    type="tel"
                    value={newBizPhone}
                    onChange={(e) => setNewBizPhone(e.target.value)}
                    placeholder="+1 555 1234"
                  />
                </label>

                <button
                  type="submit"
                  disabled={creatingBiz}
                  className="justify-self-start px-5 py-2.5 text-sm font-semibold rounded-xl shiny-btn text-white transition cursor-pointer disabled:opacity-50"
                >
                  {creatingBiz ? 'Creating…' : 'Create Business'}
                </button>

                {createMessage && (
                  <p role="alert" className="text-sm text-red-600">{createMessage}</p>
                )}
              </form>
            </div>

            {/* Delete business */}
            <div className="panel card p-5 sm:p-6 rounded-2xl bg-white border border-red-200 shadow-md">
              <h2 className="text-lg font-bold mb-1 text-red-600">Delete Business</h2>
              <p className="text-slate-500 text-sm mb-4">
                This permanently deletes your business profile and all of its leads. This cannot be undone.
              </p>

              {!confirmOpen ? (
                <button
                  type="button"
                  onClick={() => setConfirmOpen(true)}
                  className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition cursor-pointer"
                >
                  Delete Business
                </button>
              ) : (
                <div className="grid gap-3 max-w-md">
                  <p className="text-sm text-slate-600">
                    Type <span className="font-semibold text-[#0f172a]">{businessName}</span> to confirm deletion.
                  </p>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder={businessName}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={confirmText !== businessName || deleting}
                      className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-red-600 text-white hover:opacity-90 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {deleting ? 'Deleting…' : 'Confirm Delete'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setConfirmOpen(false); setConfirmText(''); }}
                      className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
