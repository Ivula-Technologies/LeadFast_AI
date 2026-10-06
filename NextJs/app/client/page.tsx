'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTypewriter } from '../hooks/useTypewriter';
import { supabaseAnon as supabase, hasSupabaseConfig } from '@/lib/supabase';

interface Contractor {
  id: string;
  business_name: string;
  trade: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  plan: string | null;
}

export default function ClientMarketplacePage() {
  const [pageTitle, pageTitleDone] = useTypewriter('Browse Contractors & Submit Requests', 55, 300);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [contractorsLoading, setContractorsLoading] = useState(true);
  const [selectedTrade, setSelectedTrade] = useState('All');
  const [selectedContractor, setSelectedContractor] = useState('');
  const [selectedContractorId, setSelectedContractorId] = useState('');
  const [targetBusinessUuid, setTargetBusinessUuid] = useState('');
  const [copiedUuidId, setCopiedUuidId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [aiReply, setAiReply] = useState('');

  useEffect(() => {
    async function fetchPublicContractors() {
      if (hasSupabaseConfig && supabase) {
        setContractorsLoading(true);
        try {
          const { data, error } = await supabase
            .from('businesses')
            .select('id, business_name, trade, contact_email, contact_phone, plan')
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Error fetching registered contractors:', error);
          } else if (data) {
            setContractors(data as Contractor[]);
          }
        } catch (err) {
          console.error('Fetch error:', err);
        } finally {
          setContractorsLoading(false);
        }
      } else {
        setContractorsLoading(false);
      }
    }

    fetchPublicContractors();
  }, []);

  const tradesList = useMemo(() => {
    const unique = Array.from(new Set(contractors.map((c) => c.trade).filter(Boolean))) as string[];
    return unique.length > 0 ? unique : ['Plumbing', 'HVAC', 'Electrical', 'Roofing', 'General Contracting'];
  }, [contractors]);

  const visibleContractors = useMemo(() => {
    if (selectedTrade === 'All') return contractors;
    return contractors.filter((c) => c.trade?.toLowerCase() === selectedTrade.toLowerCase());
  }, [selectedTrade, contractors]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus('');
    setAiReply('');
    setTimeLeft(30);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 30000);

    const intervalId = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    try {
      const effectiveBusinessId = targetBusinessUuid.trim() || selectedContractorId || null;
      const fullMessage = selectedContractor 
        ? `[Request for ${selectedContractor}] ${formData.message}` 
        : formData.message;

      const response = await fetch('/api/lead-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: fullMessage,
          business_id: effectiveBusinessId
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Unable to submit service request.');

      setStatus(`Thank you ${formData.name}! Your request has been submitted. A confirmation email has been sent to ${formData.email}.`);
      if (result.aiReply) setAiReply(result.aiReply);
      setFormData({ name: '', email: '', phone: '', message: '' });
      setSelectedContractor('');
      setSelectedContractorId('');
      setTargetBusinessUuid('');
    } catch (caught) {
      const error = caught instanceof Error ? caught : new Error('Something went wrong.');
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        setStatus('⏱️ Timeout Error: Service request execution timed out after 30 seconds before completion. The request was terminated. Please try again.');
      } else {
        setStatus(error.message || 'Submission failed. Please try again.');
      }
    } finally {
      clearInterval(intervalId);
      setLoading(false);
      setTimeLeft(30);
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundImage: `linear-gradient(to bottom, rgba(248, 250, 252, 0.60), rgba(241, 245, 249, 0.72)), url('/images/client.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <section className="container" style={{ padding: '24px 0 40px' }}>
        {/* Header + Nav */}
        <div className="panel card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
          <div>
            <p style={{ color: '#0284c7', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.24em', marginBottom: '6px', fontWeight: '600' }}>
              Client Portal · LeadFast AI
            </p>
            <h1 style={{ margin: 0, fontSize: '1.8rem', minHeight: '1.2em' }}>
              {pageTitle}
              <span style={{ display: 'inline-block', width: '2px', height: '0.8em', background: '#0284c7', marginLeft: '3px', verticalAlign: 'middle', borderRadius: '2px', opacity: pageTitleDone ? 0 : 1, animation: pageTitleDone ? 'none' : 'blink 0.9s step-end infinite', transition: 'opacity 0.4s ease' }} />
            </h1>
            <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
          </div>
          <nav className="nav" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <a href="/login" style={{ background: '#f1f5f9', color: '#0f172a', fontWeight: '500', padding: '8px 16px', borderRadius: '999px', textDecoration: 'none', border: '1px solid var(--border)' }}>
              ← Role Selection / Login
            </a>
          </nav>
        </div>

        <div className="grid grid-2" style={{ alignItems: 'start' }}>
          
          {/* Left Column: Public Directory of Available Contractors */}
          <div className="panel card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
              <div>
                <h2 style={{ margin: 0 }}>Available Contractors</h2>
                <p style={{ color: '#475569', margin: '4px 0 0', fontSize: '0.9rem' }}>
                  Browse verified contractors and their specialized trades.
                </p>
              </div>
              <select
                aria-label="Filter by trade"
                value={selectedTrade}
                onChange={(e) => setSelectedTrade(e.target.value)}
                style={{ width: 'auto', minWidth: '140px' }}
              >
                <option value="All">All Trades</option>
                {tradesList.map((trade) => (
                  <option key={trade} value={trade}>{trade}</option>
                ))}
              </select>
            </div>

            <div className="grid" style={{ gap: '12px' }}>
              {contractorsLoading ? (
                <p style={{ color: '#475569' }}>Loading directory...</p>
              ) : visibleContractors.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', border: '1px solid var(--border)', borderRadius: '12px' }}>
                  <p style={{ color: '#475569', margin: 0 }}>No registered contractors listed for this trade yet.</p>
                  <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>
                    You can still submit a general request below and we will match you with a provider.
                  </p>
                </div>
              ) : (
                visibleContractors.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      border: selectedContractor === c.business_name ? '2px solid var(--accent-2)' : '1px solid var(--border)',
                      borderRadius: '14px',
                      padding: '16px',
                      background: 'rgba(241, 245, 249, 0.7)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '1.1rem', color: '#0f172a' }}>{c.business_name}</div>
                        <div style={{ color: '#0284c7', fontSize: '0.9rem', marginTop: '2px', fontWeight: '500' }}>
                          🏷️ Trade: <strong>{c.trade || 'General Contracting'}</strong>
                        </div>
                        <div style={{ color: '#475569', fontSize: '0.8rem', marginTop: '6px', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span>🆔 UUID: <code style={{ color: '#0369a1', background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>{c.id}</code></span>
                          <button
                            type="button"
                            data-plain="true"
                            onClick={() => {
                              navigator.clipboard.writeText(c.id);
                              setTargetBusinessUuid(c.id);
                              setSelectedContractor(c.business_name);
                              setSelectedContractorId(c.id);
                              setCopiedUuidId(c.id);
                              setTimeout(() => setCopiedUuidId(null), 2500);
                            }}
                            style={{
                              background: copiedUuidId === c.id ? '#16a34a' : 'rgba(2, 132, 199, 0.1)',
                              border: '1px solid var(--accent-2)',
                              color: copiedUuidId === c.id ? '#ffffff' : '#0284c7',
                              fontSize: '0.72rem',
                              fontWeight: '600',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                          >
                            {copiedUuidId === c.id ? '✓ Copied to Form!' : '📋 Copy UUID'}
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn"
                        onClick={() => {
                          setSelectedContractor(c.business_name);
                          setSelectedContractorId(c.id);
                          setTargetBusinessUuid(c.id);
                        }}
                        style={{
                          background: selectedContractor === c.business_name ? 'var(--accent-2)' : '#ffffff',
                          color: selectedContractor === c.business_name ? '#ffffff' : '#0f172a',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          padding: '6px 14px',
                          border: '1px solid var(--border)'
                        }}
                      >
                        {selectedContractor === c.business_name ? '✓ Selected' : 'Request Quote'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column: Lead Service Request Form */}
          <div className="panel card">
            <h2 style={{ marginTop: 0 }}>Submit Service Request</h2>
            <p style={{ color: '#475569', marginBottom: '16px', fontSize: '0.9rem' }}>
              {selectedContractor 
                ? `Direct request to ${selectedContractor}` 
                : 'Send your project details to matched contractors. You will receive an instant email confirmation.'}
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px' }}>
              {selectedContractor && (
                <div style={{ padding: '8px 12px', background: 'rgba(2, 132, 199, 0.08)', border: '1px solid var(--accent-2)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: '#0284c7' }}>
                    Target Contractor: <strong>{selectedContractor}</strong>
                  </span>
                  <button type="button" onClick={() => { setSelectedContractor(''); setSelectedContractorId(''); setTargetBusinessUuid(''); }} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.8rem' }}>
                    Clear
                  </button>
                </div>
              )}

              <label style={{ display: 'grid', gap: '4px' }}>
                <span style={{ fontSize: '0.85rem', color: '#0284c7', fontWeight: '500' }}>Target Contractor Business UUID (Optional)</span>
                <input
                  value={targetBusinessUuid}
                  onChange={(e) => setTargetBusinessUuid(e.target.value)}
                  placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
                  style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                />
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Paste a contractor&apos;s Business UUID here to direct your lead straight to their private dashboard.
                </span>
              </label>

              <label style={{ display: 'grid', gap: '4px' }}>
                <span style={{ fontSize: '0.85rem', color: '#475569' }}>Your Full Name *</span>
                <input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="John Smith" />
              </label>

              <label style={{ display: 'grid', gap: '4px' }}>
                <span style={{ fontSize: '0.85rem', color: '#475569' }}>Email Address *</span>
                <input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="john@example.com" />
              </label>

              <label style={{ display: 'grid', gap: '4px' }}>
                <span style={{ fontSize: '0.85rem', color: '#475569' }}>Phone Number</span>
                <input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+1 (555) 000-0000" />
              </label>

              <label style={{ display: 'grid', gap: '4px' }}>
                <span style={{ fontSize: '0.85rem', color: '#475569' }}>Project Details & Message *</span>
                <textarea rows={4} required value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} placeholder="Describe what work or repair you need done..." />
              </label>

              <button
                type="submit"
                className="btn"
                style={{ color: 'white', padding: '12px 16px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="spinner" style={{ width: '18px', height: '18px' }} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
                      <path d="M12 2A10 10 0 0 1 22 12" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    <span>Submitting Request… ({timeLeft}s)</span>
                  </>
                ) : (
                  'Submit Request to Contractors'
                )}
              </button>

              {status && (
                <div style={{ marginTop: '12px', padding: '12px', borderRadius: '10px', background: status.includes('failed') || status.includes('Unable') ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', border: `1px solid ${status.includes('failed') || status.includes('Unable') ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}` }}>
                  <p style={{ margin: 0, color: status.includes('failed') || status.includes('Unable') ? '#dc2626' : '#15803d', fontSize: '0.9rem' }}>{status}</p>
                </div>
              )}

              {aiReply && (
                <div style={{ marginTop: '12px', padding: '14px', borderRadius: '10px', background: 'rgba(2,132,199,0.06)', border: '1px solid rgba(2,132,199,0.2)' }}>
                  <p style={{ color: '#0284c7', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px', marginTop: 0, fontWeight: '600' }}>Confirmation Reply</p>
                  <p style={{ margin: 0, color: '#0f172a', whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>{aiReply}</p>
                </div>
              )}
            </form>
          </div>

        </div>
      </section>
    </main>
  );
}