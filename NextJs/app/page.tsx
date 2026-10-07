'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTypewriter } from './hooks/useTypewriter';

// ─── Trade data for the animated carousel ───────────────────────────────────
const TRADES = [
  {
    num: '1',
    title: 'Plumbing & Pipefitting Specialists',
    desc: 'Leak detection, pipe repairs, water heater installation, and 24/7 emergency plumbing dispatch.',
    img: '/images/plumbing.jpg',
    alt: 'Plumbing & Pipefitting',
    accent: '#38bdf8',
    border: 'rgba(56, 189, 248, 0.35)',
    shadow: 'rgba(56,189,248,0.25)',
    imgBorder: 'rgba(56,189,248,0.2)',
  },
  {
    num: '2',
    title: 'HVAC & Climate Control Technicians',
    desc: 'Air conditioning installation, furnace heating repairs, ventilation ductwork, and thermostat automation.',
    img: '/images/HVAC.jpg',
    alt: 'HVAC & Climate Control',
    accent: '#FFD166',
    border: 'rgba(255, 209, 102, 0.35)',
    shadow: 'rgba(255,209,102,0.25)',
    imgBorder: 'rgba(255,209,102,0.2)',
  },
  {
    num: '3',
    title: 'Certified Electrical Contractors',
    desc: 'Electrical panel upgrades, full building rewiring, EV charger setup, and safety inspection services.',
    img: '/images/Electrical.jpg',
    alt: 'Certified Electrical Contractors',
    accent: '#4ade80',
    border: 'rgba(74, 222, 128, 0.35)',
    shadow: 'rgba(74,222,128,0.25)',
    imgBorder: 'rgba(74,222,128,0.2)',
  },
  {
    num: '4',
    title: 'Roofing & Exterior Waterproofing',
    desc: 'Shingle replacement, gutter system repair, roof leak sealing, and structural weatherproofing.',
    img: '/images/roofing.jpg',
    alt: 'Roofing & Exterior Waterproofing',
    accent: '#f472b6',
    border: 'rgba(244, 114, 182, 0.35)',
    shadow: 'rgba(244,114,182,0.25)',
    imgBorder: 'rgba(244,114,182,0.2)',
  },
  {
    num: '5',
    title: 'General Contracting & Remodeling Pros',
    desc: 'Home renovations, kitchen/bathroom upgrades, carpentry, drywall repair, and turnkey construction management.',
    img: '/images/remodel.jpg',
    alt: 'General Contracting & Remodeling',
    accent: '#c084fc',
    border: 'rgba(192, 132, 252, 0.35)',
    shadow: 'rgba(192,132,252,0.25)',
    imgBorder: 'rgba(192,132,252,0.2)',
  },
];

// ─── Carousel component (shows one trade at a time, cycles every 3 s) ────────
function TradeCarousel() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % TRADES.length);
        setVisible(true);
      }, 400);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const trade = TRADES[current];

  return (
    <div
      className="trade-carousel-card"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        background: 'rgba(255, 255, 255, 0.95)',
        border: `1px solid ${trade.border}`,
        borderRadius: '16px',
        padding: '20px',
        boxShadow: `0 8px 24px ${trade.shadow}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      {/* Dot indicators */}
      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
        {TRADES.map((_, i) => (
          <span
            key={i}
            style={{
              width: i === current ? '22px' : '7px',
              height: '7px',
              borderRadius: '999px',
              background: i === current ? trade.accent : 'rgba(0,0,0,0.15)',
              transition: 'all 0.3s ease',
              display: 'inline-block',
            }}
          />
        ))}
      </div>

      {/* Trade header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <img
          src={trade.img}
          alt={`${trade.alt} Icon`}
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '10px',
            objectFit: 'cover',
            border: `2px solid ${trade.accent}`,
            boxShadow: `0 4px 12px ${trade.shadow}`,
            flexShrink: 0,
          }}
        />
        <div>
          <div
            style={{
              fontSize: '0.72rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: trade.accent,
              marginBottom: '4px',
            }}
          >
            Specialty {trade.num} of {TRADES.length}
          </div>
          <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '1.05rem', fontFamily: 'Poppins, sans-serif' }}>
            {trade.num}. {trade.title}
          </div>
          <div style={{ color: '#475569', fontSize: '0.88rem', marginTop: '4px', lineHeight: '1.5' }}>
            {trade.desc}
          </div>
        </div>
      </div>

      {/* Trade image */}
      <div style={{ display: 'flex', justifyContent: 'center', flex: 1, alignItems: 'center' }}>
        <img
          src={trade.img}
          alt={trade.alt}
          className="trade-carousel-img"
          style={{
            objectFit: 'cover',
            borderRadius: '12px',
            border: `1px solid ${trade.imgBorder}`,
          }}
        />
      </div>
    </div>
  );
}

// ─── Main Landing Page ────────────────────────────────────────────────────────
export default function LandingPage() {
  const [heroTitle, heroDone] = useTypewriter('High-Velocity LeadFast AI System', 60, 400);

  // Hamburger drawer state
  const [menuOpen, setMenuOpen] = useState(false);

  // Modals state for Hamburger menu sections
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [howItWorksModalOpen, setHowItWorksModalOpen] = useState(false);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'radial-gradient(circle at 50% -20%, rgba(2, 132, 199, 0.08), transparent 60%), #f8fafc',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Top Header Navigation */}
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
          {/* Logo Brand */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
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

          {/* Right Header Navigation & Hamburger Trigger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/login" className="shiny-green-btn" style={{ padding: '9px 20px', fontSize: '0.9rem', borderRadius: '8px' }}>
              Portal Login →
            </Link>

            {/* Hamburger Button */}
            <button
              type="button"
              data-plain="true"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle Navigation Menu"
              style={{
                background: menuOpen ? '#0284c7' : 'rgba(2, 132, 199, 0.1)',
                color: menuOpen ? '#ffffff' : '#0284c7',
                border: '1px solid rgba(2, 132, 199, 0.3)',
                borderRadius: '12px',
                padding: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {menuOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                )}
              </svg>

            </button>
          </div>
        </div>
      </header>

      {/* Hamburger Slide-Over Drawer */}
      {menuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            justifyContent: 'flex-end',
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(6px)',
            animation: 'fadeIn 0.2s ease-out',
          }}
          onClick={() => setMenuOpen(false)}
        >
          <div
            style={{
              width: 'min(360px, 85vw)',
              height: '100%',
              background: '#fdfaf5',
              boxShadow: '-10px 0 30px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              padding: '24px',
              animation: 'slideLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src="/icon.svg" alt="Logo" style={{ width: '28px', height: '28px' }} />
                <span style={{ fontWeight: '800', fontFamily: 'Poppins, sans-serif', fontSize: '1.2rem', color: '#0f172a' }}>
                  Navigation Menu
                </span>
              </div>
              <button
                type="button"
                data-plain="true"
                onClick={() => setMenuOpen(false)}
                style={{
                  background: 'rgba(0,0,0,0.05)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '34px',
                  height: '34px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '700',
                  color: '#475569',
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>

            {/* Menu Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
              <button
                type="button"
                data-plain="true"
                onClick={() => {
                  setMenuOpen(false);
                  setAboutModalOpen(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  background: 'rgba(79, 70, 229, 0.06)',
                  color: '#4f46e5',
                  fontWeight: '700',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '1rem',
                  border: '1px solid rgba(79, 70, 229, 0.2)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <span style={{ fontSize: '1.3rem' }}>⚡</span>
                <span>About LeadFast AI</span>
              </button>

              <button
                type="button"
                data-plain="true"
                onClick={() => {
                  setMenuOpen(false);
                  setHowItWorksModalOpen(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  background: 'rgba(79, 70, 229, 0.06)',
                  color: '#4f46e5',
                  fontWeight: '700',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '1rem',
                  border: '1px solid rgba(79, 70, 229, 0.2)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <span style={{ fontSize: '1.3rem' }}>⚙️</span>
                <span>How LeadFast AI Works</span>
              </button>

              <Link
                href="/notifications"
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  background: 'rgba(79, 70, 229, 0.06)',
                  color: '#4f46e5',
                  fontWeight: '700',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '1rem',
                  border: '1px solid rgba(79, 70, 229, 0.2)',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.3rem' }}>🔔</span>
                  <span>Developer Notifications</span>
                </div>
                <span style={{ fontSize: '0.72rem', background: '#4f46e5', color: '#ffffff', padding: '2px 8px', borderRadius: '999px', fontWeight: '700' }}>
                  UPDATES
                </span>
              </Link>

              <a
                href="#features"
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  background: 'rgba(79, 70, 229, 0.04)',
                  color: '#4f46e5',
                  fontWeight: '600',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '0.98rem',
                  border: '1px solid rgba(79, 70, 229, 0.15)',
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>🔧</span>
                <span>Platform Features</span>
              </a>

              <a
                href="#contact"
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  background: 'rgba(79, 70, 229, 0.04)',
                  color: '#4f46e5',
                  fontWeight: '600',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '0.98rem',
                  border: '1px solid rgba(79, 70, 229, 0.15)',
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>📞</span>
                <span>Website Owner &amp; Support Contact</span>
              </a>
            </div>

            {/* Drawer Footer CTA */}
            <div style={{ paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="shiny-green-btn"
                style={{ width: '100%', padding: '12px 0', fontSize: '0.95rem' }}
              >
                Go to Portal Login →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── ABOUT LEADFAST AI MODAL ────────────────────────────────────────── */}
      {aboutModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 110,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.2s ease-out',
          }}
          onClick={() => setAboutModalOpen(false)}
        >
          <div
            className="panel card"
            style={{
              width: 'min(900px, 95vw)',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#ffffff',
              padding: '32px',
              borderRadius: '20px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.8rem', fontFamily: 'Poppins, sans-serif', color: '#0f172a', margin: 0 }}>
                ⚡ About LeadFast AI
              </h2>
              <button
                type="button"
                data-plain="true"
                onClick={() => setAboutModalOpen(false)}
                style={{
                  background: 'rgba(0,0,0,0.06)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  lineHeight: 1,
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body Grid */}
            <div className="about-grid" style={{ marginBottom: '24px' }}>
              <div style={{ color: '#1e293b', fontSize: '1rem', lineHeight: '1.7' }}>
                <p style={{ marginBottom: '16px' }}>
                  <strong>LeadFast AI</strong> is an instant lead response system engineered specifically for home service
                  contractors like HVAC technicians, plumbers, electricians, and roofers. By intercepting website contact
                  form submissions and generating personalized, context-aware email replies within 30 seconds, LeadFast AI
                  bridges the critical response-time gap when contractors are busy in the field—ensuring no high-intent lead
                  is lost to competitors while logging all interactions into a streamlined business dashboard.
                </p>
                <p>
                  For clients, this means receiving immediate, intelligent answers tailored to their specific home service
                  needs without waiting hours or days. For contractors, it provides a 24/7 automated sales assistant that
                  turns website traffic into booked jobs.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '1.15rem', fontFamily: 'Poppins, sans-serif', color: '#0f172a', marginBottom: '12px' }}>
                  Featured Contractor Specialties
                </h3>
                <TradeCarousel />
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <button
                type="button"
                className="shiny-green-btn"
                onClick={() => setAboutModalOpen(false)}
                style={{ padding: '8px 24px', fontSize: '0.9rem' }}
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── HOW IT WORKS MODAL ────────────────────────────────────────────── */}
      {howItWorksModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 110,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.2s ease-out',
          }}
          onClick={() => setHowItWorksModalOpen(false)}
        >
          <div
            className="panel card"
            style={{
              width: 'min(900px, 95vw)',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#ffffff',
              padding: '32px',
              borderRadius: '20px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.8rem', fontFamily: 'Poppins, sans-serif', color: '#0f172a', margin: 0 }}>
                ⚙️ How LeadFast AI Works
              </h2>
              <button
                type="button"
                data-plain="true"
                onClick={() => setHowItWorksModalOpen(false)}
                style={{
                  background: 'rgba(0,0,0,0.06)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  lineHeight: 1,
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            <div className="grid grid-3" style={{ gap: '20px', marginBottom: '24px' }}>
              <div style={{ background: 'rgba(2, 132, 199, 0.05)', padding: '20px', borderRadius: '14px', border: '1px solid rgba(2, 132, 199, 0.2)' }}>
                <div style={{ fontSize: '0.8rem', color: '#0284c7', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Step 01
                </div>
                <h4 style={{ fontSize: '1.1rem', fontFamily: 'Poppins, sans-serif', margin: '0 0 8px', color: '#0f172a' }}>
                  Browse &amp; Submit Request
                </h4>
                <p style={{ color: '#475569', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>
                  Clients browse verified contractors or submit a trade request via the Client Portal.
                </p>
              </div>

              <div style={{ background: 'rgba(217, 119, 6, 0.05)', padding: '20px', borderRadius: '14px', border: '1px solid rgba(217, 119, 6, 0.2)' }}>
                <div style={{ fontSize: '0.8rem', color: '#d97706', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Step 02
                </div>
                <h4 style={{ fontSize: '1.1rem', fontFamily: 'Poppins, sans-serif', margin: '0 0 8px', color: '#0f172a' }}>
                  Automated AI Matching
                </h4>
                <p style={{ color: '#475569', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>
                  LeadFast AI evaluates request parameters and sends direct notifications to matched businesses.
                </p>
              </div>

              <div style={{ background: 'rgba(22, 163, 74, 0.05)', padding: '20px', borderRadius: '14px', border: '1px solid rgba(22, 163, 74, 0.2)' }}>
                <div style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Step 03
                </div>
                <h4 style={{ fontSize: '1.1rem', fontFamily: 'Poppins, sans-serif', margin: '0 0 8px', color: '#0f172a' }}>
                  Instant Lead Delivery
                </h4>
                <p style={{ color: '#475569', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>
                  Contractors view job details immediately in their dashboard and connect directly with clients.
                </p>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <button
                type="button"
                className="shiny-green-btn"
                onClick={() => setHowItWorksModalOpen(false)}
                style={{ padding: '8px 24px', fontSize: '0.9rem' }}
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      <main style={{ flex: 1 }}>
        {/* ── TOP SECTION (REDESIGNED HERO SECTION) ─────────────────────────── */}
        <section
          style={{
            padding: '60px 24px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(241, 245, 249, 0.95))',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div className="container">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '40px',
                alignItems: 'center',
              }}
            >
              {/* Left Column Text Content */}
              <div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 16px',
                    borderRadius: '999px',
                    background: 'rgba(2, 132, 199, 0.12)',
                    border: '1px solid rgba(2, 132, 199, 0.3)',
                    marginBottom: '20px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.85rem',
                      color: '#0369a1',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      fontFamily: 'Poppins, sans-serif',
                    }}
                  >
                    Zero Client Drop-off Guarantee
                  </span>
                </div>

                {/* Main Heading: Are you tired of losing clients due to busy schedules? */}
                <h1
                  className="no-underline"
                  style={{
                    fontSize: 'clamp(2.2rem, 4.2vw, 3.4rem)',
                    fontWeight: '900',
                    fontFamily: 'Poppins, sans-serif',
                    lineHeight: 1.18,
                    margin: '0 0 16px',
                    color: '#0f172a',
                  }}
                >
                  Are you tired of losing clients due to busy schedules?
                </h1>

                {/* Subheading: LeadFast AI offers a solution to you... */}
                <h2
                  className="no-underline"
                  style={{
                    fontSize: 'clamp(1.15rem, 2vw, 1.4rem)',
                    fontWeight: '600',
                    fontFamily: 'Poppins, sans-serif',
                    color: '#0284c7',
                    margin: '0 0 20px',
                    lineHeight: 1.45,
                  }}
                >
                  LeadFast AI offers a solution to you and helps improve your business saving you from late replies.
                </h2>

                {/* Body Content */}
                <p
                  style={{
                    fontSize: '1.05rem',
                    color: '#475569',
                    fontFamily: 'Inter, sans-serif',
                    lineHeight: 1.75,
                    marginBottom: '32px',
                  }}
                >
                  In a world where time is key, contractors lose clients dur to late replies to clients request. LeadFast AI
                  ensures clients request are responded to within three minutes after lead submission or request.
                </p>

                {/* CTA Buttons */}
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <Link href="/login" className="shiny-green-btn" style={{ padding: '14px 32px', fontSize: '1rem' }}>
                    <span>Go to Login / Portal Page</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </Link>
                  <button
                    type="button"
                    data-plain="true"
                    onClick={() => setAboutModalOpen(true)}
                    style={{
                      background: 'rgba(2, 132, 199, 0.08)',
                      color: '#0284c7',
                      fontWeight: '700',
                      fontFamily: 'Poppins, sans-serif',
                      padding: '13px 24px',
                      borderRadius: '999px',
                      border: '1px solid rgba(2, 132, 199, 0.3)',
                      cursor: 'pointer',
                    }}
                  >
                    Learn More →
                  </button>
                </div>
              </div>

              {/* Right Column Image: Contractors */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '560px',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 20px 40px rgba(15, 23, 42, 0.15)',
                    border: '3px solid #ffffff',
                    outline: '1px solid rgba(2, 132, 199, 0.3)',
                  }}
                >
                  <img
                    src="/images/contractors.jpg"
                    alt="Professional Contractors Working with LeadFast AI"
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: '420px',
                      objectFit: 'cover',
                      display: 'block',
                      imageRendering: 'crisp-edges',
                    }}
                  />
                  {/* Badge overlay on image */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '16px',
                      left: '16px',
                      right: '16px',
                      background: 'rgba(15, 23, 42, 0.85)',
                      backdropFilter: 'blur(8px)',
                      color: '#ffffff',
                      padding: '12px 18px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '700', fontFamily: 'Poppins, sans-serif', fontSize: '0.95rem' }}>
                        ⚡ 3-Minute Response Active
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Automated Qualification &amp; Routing</div>
                    </div>
                    <span className="badge">Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECOND SECTION: HIGH VELOCITY LEADFAST AI SYSTEM (SIDE-BY-SIDE) ─── */}
        <section
          style={{
            padding: '70px 24px',
            background: '#ffffff',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div className="container">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '40px',
                alignItems: 'center',
              }}
            >
              {/* Left Column Image: contractors1.jpg (Side by side with text instead of background) */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', order: 1 }}>
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '540px',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 16px 36px rgba(15, 23, 42, 0.12)',
                    border: '3px solid #ffffff',
                    outline: '1px solid rgba(147, 51, 234, 0.25)',
                  }}
                >
                  <img
                    src="/images/contractors1.jpg"
                    alt="High Velocity LeadFast AI System"
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: '400px',
                      objectFit: 'cover',
                      display: 'block',
                      imageRendering: 'crisp-edges',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      background: 'rgba(126, 34, 206, 0.9)',
                      color: '#ffffff',
                      padding: '6px 14px',
                      borderRadius: '999px',
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      fontFamily: 'Poppins, sans-serif',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      boxShadow: '0 4px 12px rgba(126, 34, 206, 0.4)',
                    }}
                  >
                    High-Velocity System
                  </div>
                </div>
              </div>

              {/* Right Column Text Content */}
              <div style={{ order: 2 }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 16px',
                    borderRadius: '999px',
                    background: 'rgba(147, 51, 234, 0.1)',
                    border: '1px solid rgba(147, 51, 234, 0.3)',
                    marginBottom: '20px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.85rem',
                      color: '#7e22ce',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      fontFamily: 'Poppins, sans-serif',
                    }}
                  >
                    ⚡ Automated Contractor Engine
                  </span>
                </div>

                {/* Typewriter H1 Title */}
                <h2
                  style={{
                    fontSize: 'clamp(2.1rem, 3.8vw, 3rem)',
                    fontWeight: '900',
                    fontFamily: 'Poppins, sans-serif',
                    lineHeight: 1.2,
                    margin: '0 0 20px',
                    minHeight: '1.2em',
                  }}
                >
                  {heroTitle}
                  <span
                    style={{
                      display: 'inline-block',
                      width: '3px',
                      height: '0.85em',
                      background: '#7e22ce',
                      marginLeft: '4px',
                      verticalAlign: 'middle',
                      borderRadius: '2px',
                      opacity: heroDone ? 0 : 1,
                      animation: heroDone ? 'none' : 'blink 0.9s step-end infinite',
                    }}
                  />
                </h2>

                <p
                  style={{
                    fontSize: '1.08rem',
                    color: '#475569',
                    fontFamily: 'Inter, sans-serif',
                    lineHeight: 1.7,
                    marginBottom: '24px',
                  }}
                >
                  The premier AI-driven ecosystem designed for Plumbing, HVAC, Electrical, and General Contracting
                  professionals. Connect home and commercial clients with verified trade specialists through automated
                  qualification and instant routing.
                </p>

                {/* Key Pillars */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '32px' }}>
                  <div
                    style={{
                      padding: '12px 16px',
                      background: 'rgba(248, 250, 252, 0.9)',
                      borderRadius: '12px',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div style={{ fontWeight: '700', fontFamily: 'Poppins, sans-serif', color: '#0f172a', fontSize: '0.92rem' }}>
                      ⏱️ 3-Minute Intake
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>Instant response loop</div>
                  </div>

                  <div
                    style={{
                      padding: '12px 16px',
                      background: 'rgba(248, 250, 252, 0.9)',
                      borderRadius: '12px',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div style={{ fontWeight: '700', fontFamily: 'Poppins, sans-serif', color: '#0f172a', fontSize: '0.92rem' }}>
                      🔒 Trade Verified
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>Direct business dispatch</div>
                  </div>
                </div>

                <Link href="/login" className="shiny-green-btn" style={{ padding: '12px 28px', fontSize: '0.95rem' }}>
                  Explore Contractor Portal →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── DETAILED PLATFORM FEATURES ───────────────────────────────────── */}
        <section id="features" className="container" style={{ padding: '60px 0 60px' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '2.2rem', fontFamily: 'Poppins, sans-serif', margin: '0 0 12px' }}>
              Comprehensive Platform Overview
            </h2>
            <p style={{ color: '#475569', fontSize: '1.05rem', maxWidth: '640px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
              Discover how LeadFast AI streamlines lead ingestion, intelligent contractor matching, and request tracking.
            </p>
          </div>

          <div className="grid grid-3">
            <div className="panel card" style={{ padding: '28px', borderRadius: '18px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(2, 132, 199, 0.1)',
                  border: '1px solid rgba(2, 132, 199, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  marginBottom: '20px',
                }}
              >
                🎯
              </div>
              <h3 style={{ fontSize: '1.3rem', fontFamily: 'Poppins, sans-serif', margin: '0 0 10px' }}>
                Instant Lead Qualification
              </h3>
              <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6, margin: 0, fontFamily: 'Inter, sans-serif' }}>
                Client service requests are parsed and structured immediately by AI algorithms to determine job urgency,
                scope, and trade requirements without delays.
              </p>
            </div>

            <div className="panel card" style={{ padding: '28px', borderRadius: '18px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(22, 163, 74, 0.1)',
                  border: '1px solid rgba(22, 163, 74, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  marginBottom: '20px',
                }}
              >
                ⚡
              </div>
              <h3 style={{ fontSize: '1.3rem', fontFamily: 'Poppins, sans-serif', margin: '0 0 10px' }}>
                Smart Contractor Dispatch
              </h3>
              <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6, margin: 0, fontFamily: 'Inter, sans-serif' }}>
                Directly targets registered contractors by Business UUID or matching trade discipline (Plumbing, HVAC,
                Electrical, General Contracting).
              </p>
            </div>

            <div className="panel card" style={{ padding: '28px', borderRadius: '18px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(217, 119, 6, 0.1)',
                  border: '1px solid rgba(217, 119, 6, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  marginBottom: '20px',
                }}
              >
                📊
              </div>
              <h3 style={{ fontSize: '1.3rem', fontFamily: 'Poppins, sans-serif', margin: '0 0 10px' }}>
                Interactive Dashboard &amp; CRM
              </h3>
              <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6, margin: 0, fontFamily: 'Inter, sans-serif' }}>
                Contractors access a private portal to view incoming leads, manage customer inquiries, update status, and
                review business analytics.
              </p>
            </div>
          </div>
        </section>

        {/* ── TRANSITION CTA BANNER ────────────────────────────────────────── */}
        <section className="container" style={{ paddingBottom: '60px', textAlign: 'center' }}>
          <div
            className="panel card"
            style={{
              padding: '40px 24px',
              borderRadius: '20px',
              background: 'radial-gradient(circle at center, rgba(2, 132, 199, 0.08), transparent 70%), var(--panel)',
            }}
          >
            <h2 style={{ fontSize: '1.9rem', fontFamily: 'Poppins, sans-serif', margin: '0 0 12px' }}>
              Ready to Accelerate Your Contractor Operations?
            </h2>
            <p style={{ color: '#475569', maxWidth: '540px', margin: '0 auto 28px', fontFamily: 'Inter, sans-serif' }}>
              Log in to access your business dashboard or submit a client service request today.
            </p>
            <Link href="/login" className="shiny-green-btn">
              Proceed to Login Page →
            </Link>
          </div>
        </section>
      </main>

      {/* ── WEBSITE OWNER CONTACT & FOOTER ─────────────────────────────────── */}
      <footer
        id="contact"
        style={{
          background: 'rgba(241, 245, 249, 0.95)',
          borderTop: '1px solid var(--border)',
          padding: '60px 0 30px',
        }}
      >
        <div className="container">
          <div className="grid grid-2" style={{ gap: '40px', marginBottom: '40px', alignItems: 'start' }}>
            {/* Owner Info */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <img src="/icon.svg" alt="LeadFast AI" style={{ width: '28px', height: '28px' }} />
                <h3 style={{ fontSize: '1.5rem', fontFamily: 'Poppins, sans-serif', margin: 0 }}>LeadFast AI</h3>
              </div>
              <p style={{ color: '#475569', lineHeight: 1.6, fontSize: '0.95rem', maxWidth: '480px', margin: '0 0 20px', fontFamily: 'Inter, sans-serif' }}>
                LeadFast AI is an enterprise AI automation solution built specifically for contractors and service marketplace
                operations. Powered by Ivula Technologies.
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <span className="badge">✓ Verified Platform</span>
                <span className="badge warn">⚡ 24/7 AI Dispatch</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '24px' }}>
                <img
                  src="/images/team/bius-founder.webp"
                  alt="Bius Michael Joseph, Founder and CEO of Ivula Technologies"
                  width={56}
                  height={56}
                  loading="lazy"
                  style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ffffff', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.15)' }}
                />
                <div style={{ fontFamily: 'Inter, sans-serif' }}>
                  <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Built by</div>
                  <div style={{ fontWeight: 600, color: '#0f172a', fontFamily: 'Poppins, sans-serif' }}>Bius Michael Joseph</div>
                  <div style={{ color: '#475569', fontSize: '0.85rem' }}>Founder &amp; CEO, Ivula Technologies</div>
                </div>
              </div>
            </div>

            {/* Owner Support Contact Details */}
            <div className="panel card" style={{ padding: '24px', background: 'rgba(255, 255, 255, 0.9)' }}>
              <h3 style={{ fontSize: '1.2rem', fontFamily: 'Poppins, sans-serif', margin: '0 0 16px' }}>
                Website Owner &amp; Support Contact
              </h3>
              <div style={{ display: 'grid', gap: '14px', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.2rem' }}>🏢</span>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      Website Owner / Company
                    </div>
                    <div style={{ fontWeight: '600', color: '#0f172a', fontFamily: 'Poppins, sans-serif' }}>
                      Ivula Technologies
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.2rem' }}>💬</span>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      Phone / WhatsApp
                    </div>
                    <a
                      href="https://wa.me/254743761460"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#0284c7', fontWeight: '600' }}
                    >
                      +254 743 761 460
                    </a>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.2rem' }}>📧</span>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      Email Address
                    </div>
                    <div style={{ color: '#0284c7', fontWeight: '500' }}>
                      <a href="mailto:contact@ivula.co.ke" style={{ color: '#0284c7', fontWeight: '600' }}>
                        contact@ivula.co.ke
                      </a>{' '}
                      /{' '}
                      <a href="mailto:ivula@gmail.com" style={{ color: '#0284c7', fontWeight: '600' }}>
                        ivula@gmail.com
                      </a>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.2rem' }}>📍</span>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      Office Address
                    </div>
                    <div style={{ color: '#334155' }}>Emperor Plaza, 05 Koinange Street, Nairobi, Kenya</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              borderTop: '1px solid var(--border)',
              paddingTop: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              fontSize: '0.85rem',
              color: '#64748b',
            }}
          >
            <div>© {new Date().getFullYear()} LeadFast AI. All rights reserved. Owned &amp; Operated by Ivula Technologies.</div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button
                type="button"
                data-plain="true"
                onClick={() => setAboutModalOpen(true)}
                style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', padding: 0 }}
              >
                About LeadFast AI
              </button>
              <button
                type="button"
                data-plain="true"
                onClick={() => setHowItWorksModalOpen(true)}
                style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', padding: 0 }}
              >
                How It Works
              </button>
              <Link href="/notifications" style={{ color: '#0284c7', fontWeight: '600' }}>
                Developer Notifications
              </Link>
              <Link href="/login" style={{ color: '#475569' }}>
                Portal Login
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Global CSS Animations for Modal & Hamburger Drawer */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
