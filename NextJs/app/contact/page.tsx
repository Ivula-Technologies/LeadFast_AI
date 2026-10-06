'use client';

import Link from 'next/link';
import { useState } from 'react';
import LogoutButton from '../components/LogoutButton';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [targetBusinessUuid, setTargetBusinessUuid] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [aiReply, setAiReply] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
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
      const response = await fetch('/api/lead-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          message,
          business_id: targetBusinessUuid.trim() || undefined
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const result = await response.json();

      if (!response.ok) {
        setStatus(result.message || 'Something went wrong.');
      } else {
        setStatus('Your message was received! An AI reply has been sent to your email.');
        if (result.aiReply) setAiReply(result.aiReply);
        setName('');
        setEmail('');
        setTargetBusinessUuid('');
        setMessage('');
      }
    } catch (caught) {
      const error = caught instanceof Error ? caught : new Error('Something went wrong.');
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        setStatus('⏱️ Timeout Error: Service execution timed out after 30 seconds before completion. The request was terminated. Please try again.');
      } else {
        setStatus(error.message || 'Something went wrong. Please try submitting again.');
      }
    } finally {
      clearInterval(intervalId);
      setLoading(false);
      setTimeLeft(30);
    }
  }

  return (
    <main>
      <section className="container" style={{ padding: '24px 0 40px' }}>
        {/* Header + Nav */}
        <div className="panel card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '18px' }}>
          <div>
            <p style={{ color: '#0284c7', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.24em', marginBottom: '6px', fontWeight: '600' }}>AI-Powered Contact</p>
            <h1 style={{ margin: 0, fontSize: '1.8rem' }}>LeadFast AI Contact Form</h1>
          </div>
          <nav className="nav" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/">Overview</Link>
            <a href="/leads">Leads</a>
            <a href="/contact" className="active">LeadFast AI</a>
            <a href="/login">Login</a>
            <LogoutButton />
          </nav>
        </div>

        {/* Contact Form */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="panel card" style={{ width: '100%', maxWidth: '600px' }}>
            <p style={{ color: '#475569', marginBottom: '20px', marginTop: 0 }}>
              Submit your enquiry and our AI assistant will respond to your email within seconds, powered by Claude AI.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px' }}>
              <label style={{ display: 'grid', gap: '6px' }}>
                <span style={{ color: '#475569', fontSize: '0.9rem' }}>Full Name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Smith"
                  required
                />
              </label>

              <label style={{ display: 'grid', gap: '6px' }}>
                <span style={{ color: '#475569', fontSize: '0.9rem' }}>Email Address *</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  required
                />
              </label>

              <label style={{ display: 'grid', gap: '6px' }}>
                <span style={{ color: '#0284c7', fontSize: '0.9rem', fontWeight: '500' }}>Target Contractor Business UUID (Optional)</span>
                <input
                  type="text"
                  value={targetBusinessUuid}
                  onChange={(e) => setTargetBusinessUuid(e.target.value)}
                  placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
                  style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                />
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Paste a contractor&apos;s Business UUID to route this lead directly to their workspace.
                </span>
              </label>

              <label style={{ display: 'grid', gap: '6px' }}>
                <span style={{ color: '#475569', fontSize: '0.9rem' }}>Message</span>
                <textarea
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your project or enquiry..."
                  required
                />
              </label>

              <button
                type="submit"
                className="btn"
                style={{ color: 'white', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="spinner" style={{ width: '18px', height: '18px' }} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
                      <path d="M12 2A10 10 0 0 1 22 12" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    <span>Processing to AI… ({timeLeft}s)</span>
                  </>
                ) : (
                  'Submit to LeadFast AI'
                )}
              </button>
            </form>

            {status && (
              <div style={{ marginTop: '16px', padding: '14px', borderRadius: '12px', background: status.includes('wrong') ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', border: `1px solid ${status.includes('wrong') ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}` }}>
                <p style={{ margin: 0, color: status.includes('wrong') ? '#dc2626' : '#15803d' }}>{status}</p>
              </div>
            )}

            {aiReply && (
              <div style={{ marginTop: '16px', padding: '14px', borderRadius: '12px', background: 'rgba(2,132,199,0.06)', border: '1px solid rgba(2,132,199,0.2)' }}>
                <p style={{ color: '#0284c7', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px', marginTop: 0, fontWeight: '600' }}>AI Reply Preview</p>
                <p style={{ margin: 0, color: '#0f172a', whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>{aiReply}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
