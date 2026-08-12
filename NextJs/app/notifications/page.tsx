'use client';

import Link from 'next/link';
import { useState } from 'react';

interface NotificationItem {
  id: string;
  date: string;
  category: 'Feature' | 'Update' | 'Maintenance' | 'Announcement';
  title: string;
  author: string;
  summary: string;
  details: string[];
  unread?: boolean;
}

const NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    date: 'August 11, 2026',
    category: 'Update',
    title: 'High-Velocity AI Response System & UI Redesign',
    author: 'LeadFast Dev Team',
    summary: 'Major landing page redesign with 3-minute lead response optimization and streamlined trade dispatch.',
    details: [
      'Redesigned top hero section highlighting zero client drop-off with 3-minute AI intake.',
      'Moved High Velocity LeadFast AI System section to primary row layout with sharp side-by-side visual integration.',
      'Updated typography across all modules: Poppins font for all headings/subheadings and Inter for body text.',
      'Introduced main hamburger navigation menu for quick access to About LeadFast AI, How it Works, and Developer Notifications.',
    ],
    unread: true,
  },
  {
    id: 'notif-2',
    date: 'August 04, 2026',
    category: 'Feature',
    title: 'Instant Email & Lead Dispatch Routing Upgrade',
    author: 'Ivula Technologies Lead Engineer',
    summary: 'Lead qualification response time reduced to under 30 seconds for contractor contact forms.',
    details: [
      'Integrated Resend & Supabase real-time webhooks for instantaneous lead dispatch.',
      'Smart trade categorization supporting Plumbing, HVAC, Electrical, Roofing, and General Contractors.',
      'Automated email templates customized per business UUID for high conversion rates.',
    ],
  },
  {
    id: 'notif-3',
    date: 'July 28, 2026',
    category: 'Announcement',
    title: 'Developer Release: Multi-Tenant Contractor Portal v2.4',
    author: 'LeadFast Dev Team',
    summary: 'Enhanced analytics dashboard and trade specialty carousel view for service professionals.',
    details: [
      'Added automated lead history export to CSV in contractor dashboard.',
      'Interactive specialty trade carousel with 1-second auto cycle for quick service discovery.',
      '24/7 server health monitoring and status indicator added to footer.',
    ],
  },
  {
    id: 'notif-4',
    date: 'July 15, 2026',
    category: 'Maintenance',
    title: 'Scheduled Infrastructure Optimization Complete',
    author: 'System Operations',
    summary: 'Upgraded database connection pool and optimized API route latency across regional servers.',
    details: [
      'Zero-downtime database migration completed successfully.',
      'API endpoint latency reduced by 40% globally.',
    ],
  },
];

export default function NotificationsPage() {
  const [filter, setFilter] = useState<'All' | 'Feature' | 'Update' | 'Maintenance' | 'Announcement'>('All');
  const [expandedId, setExpandedId] = useState<string | null>('notif-1');

  const filteredNotifs = NOTIFICATIONS.filter(n => filter === 'All' || n.category === filter);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      {/* Header Navigation */}
      <header
        style={{
          borderBottom: '1px solid var(--border)',
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          className="container"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '76px' }}
        >
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.25), rgba(109, 40, 217, 0.4))',
                border: '1px solid #a855f7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(168, 85, 247, 0.4)',
              }}
            >
              <img src="/icon.svg" alt="LeadFast AI Logo" style={{ width: '26px', height: '26px' }} />
            </div>
            <span
              style={{ fontSize: '1.4rem', fontWeight: '800', fontFamily: 'Poppins, sans-serif', letterSpacing: '-0.02em' }}
              className="shiny-gold-heading"
            >
              LeadFast AI
            </span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Link
              href="/"
              style={{
                color: '#0284c7',
                fontWeight: '600',
                fontSize: '0.92rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                background: 'rgba(2, 132, 199, 0.08)',
              }}
            >
              ← Back to Home Page
            </Link>
            <Link href="/login" className="shiny-green-btn" style={{ padding: '8px 18px', fontSize: '0.88rem' }}>
              Portal Login
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '48px 24px' }}>
        <div className="container" style={{ maxWidth: '960px' }}>
          {/* Title Card */}
          <div
            className="panel card"
            style={{
              padding: '36px',
              marginBottom: '32px',
              background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.06), rgba(255, 255, 255, 0.95))',
              border: '1px solid rgba(2, 132, 199, 0.25)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <span
                style={{
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  color: '#0369a1',
                  background: 'rgba(2, 132, 199, 0.12)',
                  padding: '4px 12px',
                  borderRadius: '999px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                🔔 Developer Hub
              </span>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Live Developer Broadcasts</span>
            </div>

            <h1
              style={{
                fontSize: '2.3rem',
                fontWeight: '800',
                fontFamily: 'Poppins, sans-serif',
                margin: '0 0 14px',
                color: '#0f172a',
              }}
            >
              Developer Notifications &amp; Updates
            </h1>
            <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: '1.7', margin: 0, maxWidth: '780px' }}>
              Official developer announcements, feature release notes, system updates, and maintenance advisories from the
              Ivula Technologies engineering team.
            </p>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '28px' }}>
            {(['All', 'Update', 'Feature', 'Announcement', 'Maintenance'] as const).map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilter(cat)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '999px',
                  fontSize: '0.88rem',
                  fontWeight: '600',
                  border: filter === cat ? '1px solid #0284c7' : '1px solid var(--border)',
                  background: filter === cat ? '#0284c7' : '#ffffff',
                  color: filter === cat ? '#ffffff' : '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {cat === 'All' ? 'All Updates' : cat}
              </button>
            ))}
          </div>

          {/* Notification List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {filteredNotifs.map(n => {
              const isExpanded = expandedId === n.id;
              const categoryColors = {
                Feature: { bg: 'rgba(22, 163, 74, 0.1)', color: '#16a34a', border: 'rgba(22, 163, 74, 0.3)' },
                Update: { bg: 'rgba(2, 132, 199, 0.1)', color: '#0284c7', border: 'rgba(2, 132, 199, 0.3)' },
                Maintenance: { bg: 'rgba(217, 119, 6, 0.1)', color: '#d97706', border: 'rgba(217, 119, 6, 0.3)' },
                Announcement: { bg: 'rgba(147, 51, 234, 0.1)', color: '#9333ea', border: 'rgba(147, 51, 234, 0.3)' },
              };
              const tag = categoryColors[n.category];

              return (
                <div
                  key={n.id}
                  className="panel card"
                  style={{
                    padding: '24px 28px',
                    borderRadius: '16px',
                    border: isExpanded ? '1px solid rgba(2, 132, 199, 0.4)' : '1px solid var(--border)',
                    boxShadow: isExpanded ? '0 8px 24px rgba(2, 132, 199, 0.08)' : '0 4px 12px rgba(15, 23, 42, 0.03)',
                    transition: 'all 0.25s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          background: tag.bg,
                          color: tag.color,
                          border: `1px solid ${tag.border}`,
                          padding: '3px 10px',
                          borderRadius: '999px',
                          textTransform: 'uppercase',
                        }}
                      >
                        {n.category}
                      </span>
                      {n.unread && (
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            background: '#ef4444',
                            color: '#ffffff',
                            padding: '2px 8px',
                            borderRadius: '999px',
                          }}
                        >
                          NEW
                        </span>
                      )}
                      <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{n.date}</span>
                    </div>
                    <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: '500' }}>Posted by {n.author}</span>
                  </div>

                  <h3
                    style={{
                      fontSize: '1.3rem',
                      fontWeight: '700',
                      fontFamily: 'Poppins, sans-serif',
                      color: '#0f172a',
                      margin: '0 0 10px',
                      cursor: 'pointer',
                    }}
                    onClick={() => setExpandedId(isExpanded ? null : n.id)}
                  >
                    {n.title}
                  </h3>

                  <p style={{ color: '#334155', fontSize: '0.96rem', lineHeight: '1.6', margin: '0 0 14px' }}>
                    {n.summary}
                  </p>

                  {isExpanded && (
                    <div
                      style={{
                        marginTop: '16px',
                        paddingTop: '16px',
                        borderTop: '1px solid var(--border)',
                        background: 'rgba(248, 250, 252, 0.7)',
                        padding: '16px',
                        borderRadius: '12px',
                      }}
                    >
                      <h4
                        style={{
                          fontSize: '0.95rem',
                          fontWeight: '700',
                          fontFamily: 'Poppins, sans-serif',
                          color: '#0f172a',
                          marginBottom: '10px',
                        }}
                      >
                        Release Notes &amp; Implementation Details:
                      </h4>
                      <ul style={{ margin: 0, paddingLeft: '20px', color: '#475569', fontSize: '0.92rem', lineHeight: '1.7' }}>
                        {n.details.map((detail, idx) => (
                          <li key={idx}>{detail}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : n.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#0284c7',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      padding: 0,
                      marginTop: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {isExpanded ? 'Hide release notes ▲' : 'Read release notes ▼'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Support Banner */}
          <div
            className="panel card"
            style={{
              marginTop: '40px',
              padding: '28px',
              textAlign: 'center',
              background: 'linear-gradient(135deg, #0f172a, #1e293b)',
              color: '#ffffff',
            }}
          >
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', fontFamily: 'Poppins, sans-serif', color: '#ffffff', margin: '0 0 10px' }}>
              Have Questions or Feedback for Developers?
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.94rem', margin: '0 0 20px' }}>
              Contact our engineering team directly at contact@ivula.co.ke or call +254 743 761 460.
            </p>
            <a
              href="mailto:contact@ivula.co.ke"
              className="shiny-green-btn"
              style={{ padding: '10px 24px', fontSize: '0.9rem' }}
            >
              Email Developer Team →
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', background: '#ffffff', padding: '24px 0', textAlign: 'center', fontSize: '0.85rem', color: '#64748b' }}>
        <div className="container">
          © {new Date().getFullYear()} LeadFast AI. Developer Notifications &amp; System Log. Powered by Ivula Technologies.
        </div>
      </footer>
    </div>
  );
}
