'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import LogoutButton from '../components/LogoutButton';
import { supabaseAnon as supabase, hasSupabaseConfig } from '@/lib/supabase';

interface Lead {
  id: string;
  lead_name: string;
  lead_email: string | null;
  lead_phone: string | null;
  message: string | null;
  status: string;
  created_at: string;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [loading, setLoading] = useState(false);

  async function fetchLeads() {
    if (!hasSupabaseConfig || !supabase) return;
    try {
      let bizId: string | null = null;
      if (typeof window !== 'undefined') {
        const storedBiz = window.localStorage.getItem('hvap-business');
        if (storedBiz) {
          try {
            bizId = JSON.parse(storedBiz)?.id || null;
          } catch (e) {
            console.error('Error parsing stored business:', e);
          }
        }
      }

      if (!bizId) return;

      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('business_id', bizId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching leads:', error);
      } else {
        setLeads((data as Lead[]) ?? []);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    }
  }

  async function refreshLeads() {
    setLoading(true);
    await fetchLeads();
    setLoading(false);
  }

  // fetchLeads only sets state after awaiting Supabase; the rule can't see through the call.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchLeads(); }, []);

  const filteredLeads = useMemo(() => {
    if (selectedStatus === 'All') return leads;
    return leads.filter((lead) => lead.status === selectedStatus);
  }, [leads, selectedStatus]);

  return (
    <main>
      <section className="container" style={{ padding: '24px 0 40px' }}>
        <div className="panel card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '18px' }}>
          <div>
            <p style={{ color: '#0284c7', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.24em', marginBottom: '6px', fontWeight: '600' }}>Lead workspace</p>
            <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Contractor lead queue</h1>
          </div>
          <nav className="nav" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/">Overview</Link>
            <a href="/leads" className="active">Leads</a>
            <a href="/contact">LeadFast AI</a>
            <a href="/login">Login</a>
            <LogoutButton />
          </nav>
        </div>

        <div className="panel card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '14px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0 }}>Incoming requests</h2>
                <span className={`badge ${hasSupabaseConfig ? '' : 'warn'}`} style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
                  {hasSupabaseConfig ? 'Live Database' : 'Sandbox (Local)'}
                </span>
              </div>
              <p style={{ color: '#475569', margin: '4px 0 0' }}>
                {hasSupabaseConfig ? 'Real-time contractor leads from Supabase.' : 'Local sandbox mode.'}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {hasSupabaseConfig && (
                <button onClick={refreshLeads} disabled={loading} className="btn" style={{ padding: '6px 12px', fontSize: '0.85rem', background: '#f1f5f9', color: '#0f172a', border: '1px solid var(--border)' }}>
                  {loading ? 'Refreshing...' : 'Refresh'}
                </button>
              )}
              <select aria-label="Filter leads" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                <option value="All">All</option>
                <option value="New">New</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Booked">Booked</option>
              </select>
            </div>
          </div>

          <div className="grid" style={{ gap: '12px' }}>
            {filteredLeads.length === 0 ? (
              <p style={{ color: '#475569' }}>No leads found.</p>
            ) : filteredLeads.map((lead) => (
              <div key={lead.id} style={{ border: '1px solid var(--border)', borderRadius: '14px', padding: '14px', background: 'rgba(241, 245, 249, 0.6)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{lead.lead_name}</div>
                    <div style={{ color: '#475569', fontSize: '0.95rem' }}>{lead.lead_email}</div>
                    {lead.lead_phone && <div style={{ color: '#475569', fontSize: '0.95rem' }}>{lead.lead_phone}</div>}
                  </div>
                  <span className={`badge ${lead.status === 'Booked' ? '' : 'warn'}`}>{lead.status}</span>
                </div>
                {lead.message && <p style={{ margin: '10px 0 0', color: '#1e293b' }}>{lead.message}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
