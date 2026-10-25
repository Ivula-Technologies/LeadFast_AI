'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabaseAnon as supabase, hasSupabaseConfig } from '@/lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

interface Business {
  id: string;
  business_name: string;
}

export default function LoginPage() {
  // useSearchParams needs a Suspense boundary on a prerendered page.
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const searchParams = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get('signup') === '1');
  const [useMagicLink, setUseMagicLink] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [businessTrade, setBusinessTrade] = useState('');
  const [businessContactEmail, setBusinessContactEmail] = useState('');
  const [businessContactPhone, setBusinessContactPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBizId, setSelectedBizId] = useState('');
  const [showBizSelect, setShowBizSelect] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function resume() {
      const logoutMessage = window.localStorage.getItem('hvap-logout-message');
      if (logoutMessage) {
        window.localStorage.removeItem('hvap-logout-message');
        if (!cancelled) setMessage(logoutMessage);
        return;
      }
      // Returning from a magic link or email confirmation: Supabase already
      // has a session, so finish signing in without asking again.
      if (!supabase) return;
      const { data } = await supabase.auth.getSession();
      if (!cancelled && data.session) {
        await finishSignIn(data.session, data.session.user).catch((err) =>
          setMessage(err instanceof Error ? err.message : 'Unable to sign in.')
        );
      }
    }
    resume();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createBusiness(session: Session, details: Record<string, string>) {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify(details),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to create business.');
    return { id: result.id as string, business_name: result.business_name as string };
  }

  async function finishSignIn(session: Session, user: User) {
    const bizRes = await fetch('/api/my-businesses', {
      headers: { Authorization: `Bearer ${session.access_token}` }
    });
    const bizData = await bizRes.json();
    let bizList: Business[] = Array.isArray(bizData) ? bizData : [];

    // First sign-in after sign-up: create the business saved at sign-up.
    const pending = user.user_metadata?.pending_business;
    if (bizList.length === 0 && pending?.business_name) {
      bizList = [await createBusiness(session, pending)];
      await supabase?.auth.updateUser({ data: { pending_business: null } });
    }

    setBusinesses(bizList);

    if (bizList.length <= 1) {
      if (bizList[0]) {
        window.localStorage.setItem('hvap-business', JSON.stringify({ id: bizList[0].id, name: bizList[0].business_name }));
      }
      router.replace('/dashboard');
      return;
    }
    setSelectedBizId(bizList[0].id);
    setShowBizSelect(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (!hasSupabaseConfig || !supabase) throw new Error('Supabase configuration missing.');

      if (isSignUp) {
        const pendingBusiness = {
          business_name: businessName,
          trade: businessTrade,
          contact_email: businessContactEmail || email,
          contact_phone: businessContactPhone,
        };
        // Business details ride along in user metadata so they survive the
        // email-confirmation step; the business is created once signed in.
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { pending_business: pendingBusiness },
            emailRedirectTo: `${window.location.origin}/login`,
          },
        });
        if (signUpError) throw signUpError;
        if (signUpData.user?.identities && signUpData.user.identities.length === 0) {
          throw new Error('An account with this email already exists. Please sign in instead.');
        }

        if (!signUpData.session || !signUpData.user) {
          setMessage('Almost done! Check your email to confirm your account, then sign in.');
          return;
        }

        await finishSignIn(signUpData.session, signUpData.user);
        return;
      }

      if (useMagicLink) {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${window.location.origin}/login` },
        });
        if (error) throw error;
        setMessage('Check your email for the magic sign‑in link!');
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.session && data.user) await finishSignIn(data.session, data.user);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Unable to sign in / sign up.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundImage: `linear-gradient(to bottom, rgba(248, 250, 252, 0.60), rgba(241, 245, 249, 0.72)), url('/images/web/roofing.webp')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <section className="container" style={{ padding: '40px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>
        <Link href="/" style={{ fontWeight: 800, fontSize: '1.3rem', color: '#3B0764' }}>
          LeadFast <span style={{ color: '#F5A800' }}>AI</span>
        </Link>

        <div className="panel card" style={{ width: '100%', maxWidth: '480px', padding: '28px' }}>
          <h1 className="no-underline" style={{ margin: '0 0 6px', fontSize: '1.7rem', display: 'block' }}>
            {isSignUp ? 'Start your free trial' : 'Log in to LeadFast'}
          </h1>
          <p style={{ color: '#475569', margin: '0 0 20px', fontSize: '0.95rem' }}>
            {isSignUp
              ? '14 days free with every feature. No credit card needed.'
              : 'See your leads, your quote link and your billing.'}
          </p>

          {showBizSelect && businesses.length > 0 ? (
            <div style={{ display: 'grid', gap: '12px' }}>
              <label style={{ display: 'grid', gap: '6px' }}>
                <span style={{ color: '#475569', fontSize: '0.9rem' }}>Choose a business</span>
                <select value={selectedBizId} onChange={(e) => setSelectedBizId(e.target.value)}>
                  {businesses.map((biz) => (
                    <option key={biz.id} value={biz.id}>{biz.business_name}</option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="btn"
                style={{ color: 'white', padding: '10px 14px' }}
                onClick={() => {
                  const chosen = businesses.find((b) => b.id === selectedBizId);
                  window.localStorage.setItem('hvap-business', JSON.stringify({ id: selectedBizId, name: chosen?.business_name }));
                  router.replace('/dashboard');
                }}
              >
                Continue to Dashboard
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '12px' }}>
              {isSignUp && (
                <>
                  <label style={{ display: 'grid', gap: '6px' }}>
                    <span style={{ color: '#475569', fontSize: '0.9rem' }}>Business name</span>
                    <input required type="text" autoComplete="organization" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Rivera Plumbing" />
                  </label>
                  <label style={{ display: 'grid', gap: '6px' }}>
                    <span style={{ color: '#475569', fontSize: '0.9rem' }}>Trade</span>
                    <input type="text" list="lf-trades" value={businessTrade} onChange={(e) => setBusinessTrade(e.target.value)} placeholder="Plumbing" />
                    <datalist id="lf-trades">
                      {['Plumbing', 'HVAC', 'Electrical', 'Roofing', 'Remodeling', 'Landscaping', 'Painting', 'Handyman', 'Cleaning', 'Pest control'].map((t) => (
                        <option key={t} value={t} />
                      ))}
                    </datalist>
                  </label>
                </>
              )}

              <label style={{ display: 'grid', gap: '6px' }}>
                <span style={{ color: '#475569', fontSize: '0.9rem' }}>Email</span>
                <input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@riveraplumbing.com" />
              </label>

              {(!useMagicLink || isSignUp) && (
                <label style={{ display: 'grid', gap: '6px' }}>
                  <span style={{ color: '#475569', fontSize: '0.9rem' }}>Password</span>
                  <input
                    required={!useMagicLink}
                    type="password"
                    minLength={isSignUp ? 8 : undefined}
                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isSignUp ? 'At least 8 characters' : '••••••••'}
                  />
                </label>
              )}

              {isSignUp && (
                <>
                  <label style={{ display: 'grid', gap: '6px' }}>
                    <span style={{ color: '#475569', fontSize: '0.9rem' }}>Business phone <span style={{ color: '#94a3b8' }}>(shown to customers for urgent jobs)</span></span>
                    <input type="tel" autoComplete="tel" value={businessContactPhone} onChange={(e) => setBusinessContactPhone(e.target.value)} placeholder="(512) 555-0142" />
                  </label>
                  <label style={{ display: 'grid', gap: '6px' }}>
                    <span style={{ color: '#475569', fontSize: '0.9rem' }}>Email for new-lead alerts <span style={{ color: '#94a3b8' }}>(optional)</span></span>
                    <input type="email" value={businessContactEmail} onChange={(e) => setBusinessContactEmail(e.target.value)} placeholder="Same as your login email" />
                  </label>
                </>
              )}

              {!isSignUp && (
                <button
                  type="button"
                  data-plain="true"
                  onClick={() => setUseMagicLink(!useMagicLink)}
                  style={{ fontSize: '0.85rem', background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', textAlign: 'left', fontWeight: '500', padding: 0 }}
                >
                  {useMagicLink ? 'Use my password instead' : 'Forgot your password? Email me a sign-in link'}
                </button>
              )}

              <button
                type="submit"
                className="btn"
                style={{ color: 'white', padding: '12px 16px', marginTop: '6px' }}
                disabled={loading}
              >
                {loading ? 'Please wait…' : isSignUp ? 'Create my account' : useMagicLink ? 'Email me a sign-in link' : 'Log in'}
              </button>

              {isSignUp && (
                <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0 }}>
                  By creating an account you agree to the <Link href="/terms" style={{ color: '#0284c7' }}>Terms</Link> and{' '}
                  <Link href="/privacy" style={{ color: '#0284c7' }}>Privacy Policy</Link>.
                </p>
              )}
            </form>
          )}

          {message && (
            <p role="alert" style={{
              marginTop: '12px',
              color: message.includes('Unable') || message.includes('failed') || message.includes('Failed') || message.includes('exists') || message.includes('missing') || message.includes('Invalid')
                ? '#dc2626'
                : '#0284c7'
            }}>
              {message}
            </p>
          )}

          <p style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)', color: '#475569', fontSize: '0.9rem' }}>
            {isSignUp ? 'Already have an account? ' : 'New to LeadFast? '}
            <button
              type="button"
              data-plain="true"
              onClick={() => { setIsSignUp(!isSignUp); setShowBizSelect(false); setMessage(''); }}
              style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', padding: 0, fontWeight: 600 }}
            >
              {isSignUp ? 'Log in' : 'Start a free trial'}
            </button>
          </p>
        </div>
      </section>

      {/* Website Owner / Company Footer Details */}
      <footer style={{ background: '#f1f5f9', borderTop: '1px solid var(--border)', padding: '32px 16px 24px', marginTop: '40px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '24px' }}>
            <div>
              <h3 style={{ margin: '0 0 8px', color: '#0f172a', fontSize: '1.1rem', fontWeight: '700' }}>LeadFast AI</h3>
              <p style={{ color: '#475569', fontSize: '0.85rem', margin: 0, maxWidth: '320px' }}>
                Instant replies to every new lead for home service contractors. Powered by Ivula Technologies.
              </p>
            </div>
            <div style={{ display: 'grid', gap: '8px', fontSize: '0.88rem', color: '#334155' }}>
              <strong style={{ color: '#0284c7', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Ivula Technologies Contact</strong>
              <div>🏢 <strong>Website / Owner:</strong> Ivula Technologies</div>
              <div>💬 <strong>Phone / WhatsApp:</strong> <a href="https://wa.me/254743761460" target="_blank" rel="noopener noreferrer" style={{ color: '#0284c7', textDecoration: 'none' }}>+254 743 761 460</a></div>
              <div>✉️ <strong>Email:</strong> <a href="mailto:contact@ivula.co.ke" style={{ color: '#0284c7', textDecoration: 'none' }}>contact@ivula.co.ke</a> / <a href="mailto:ivula@gmail.com" style={{ color: '#0284c7', textDecoration: 'none' }}>ivula@gmail.com</a></div>
              <div>📍 <strong>Address:</strong> Emperor Plaza, 05 Koinange Street, Nairobi, Kenya</div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(0, 0, 0, 0.08)', paddingTop: '16px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', color: '#64748b', fontSize: '0.8rem' }}>
            <span>© {new Date().getFullYear()} LeadFast AI. All rights reserved. Owned & Operated by Ivula Technologies.</span>
            <span><Link href="/terms">Terms</Link> · <Link href="/privacy">Privacy</Link></span>
          </div>
        </div>
      </footer>
    </main>
  );
}
