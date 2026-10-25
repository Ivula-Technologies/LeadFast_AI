import type { Metadata } from 'next';
import Link from 'next/link';
import { PLANS, TRIAL_DAYS } from '@/lib/billing';
import { BOOKING_URL } from '@/lib/booking';

export const metadata: Metadata = {
  title: 'LeadFast AI: instant replies to every new lead, for contractors',
  description:
    'LeadFast AI answers every website and quote request within a minute, in your business name, then alerts you so you can call back and book the job. Free for 14 days, no card needed.',
};

const SIGNUP = '/login?signup=1';

const STEPS = [
  {
    title: 'Share your quote link or add one line to your site',
    body: 'Put your LeadFast quote link on your Google Business Profile, Facebook page, Yelp or Nextdoor, or paste one script tag into WordPress, Wix, Squarespace or any website form you already have.',
  },
  {
    title: 'Every customer gets a reply within a minute',
    body: 'LeadFast writes a short, friendly email in your business name that thanks them, confirms what they asked for and tells them you will be in touch. When they reply, it lands in your inbox.',
  },
  {
    title: 'You get the lead and book the job',
    body: 'You get an email alert with their details right away. Track every lead from New to Won, and see how much work LeadFast has brought in.',
  },
];

const FEATURES = [
  ['Instant replies in your name', 'Customers hear back while they are still comparing contractors, even when you are on a roof or under a sink.'],
  ['A quote page with no website needed', 'Your own request-a-quote page, ready to share the minute you sign up.'],
  ['Works with the form you already have', 'One script tag catches submissions from your existing contact or quote form.'],
  ['New-lead alerts', 'Name, phone, email and the job details in your inbox the moment a request comes in.'],
  ['Lead tracker and revenue won', 'Move leads through New, Contacted, Booked, Won and Lost, and see the dollars you won.'],
  ['Careful replies', 'Replies never quote prices or promise appointment times, and spam bots are filtered out.'],
];

const FAQ = [
  [
    'Do I need a website?',
    'No. Every account gets a quote request page you can share anywhere. If you do have a website, LeadFast can also catch the leads from your existing form.',
  ],
  [
    'What does the reply say?',
    'A short, friendly email from your business name that thanks the customer by name, confirms what they asked about and says you will contact them soon, with your phone number for anything urgent. It never quotes prices or promises times. You can set the tone and signature in Settings, and you can send yourself a test lead to see exactly what customers get.',
  ],
  [
    'Is there a contract?',
    'No. Plans are month to month and you can cancel any time from Manage billing in your dashboard.',
  ],
  [
    'What happens when the free trial ends?',
    `Nothing is charged automatically, because the ${TRIAL_DAYS}-day trial needs no card. Pick a plan to keep instant replies running. Your leads are still saved and emailed to you either way.`,
  ],
  [
    'What if I go over 100 replies on Starter?',
    'New leads are still saved and emailed to you; only the instant reply pauses until next month. You can upgrade to Pro for unlimited replies at any time.',
  ],
  [
    'Who is behind LeadFast?',
    'LeadFast AI is built and supported by Ivula Technologies. You can reach the founder directly using the contact details at the bottom of this page.',
  ],
];

function Check() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="w-5 h-5 flex-shrink-0 text-emerald-600" fill="currentColor">
      <path fillRule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.8 3.8 6.8-6.8a1 1 0 0 1 1.4 0Z" clipRule="evenodd" />
    </svg>
  );
}

export default function LandingPage() {
  const plans = [PLANS.starter, PLANS.pro];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.svg" alt="" width={34} height={34} className="w-[34px] h-[34px] flex-shrink-0" />
            <span className="font-extrabold text-lg tracking-tight text-[#3B0764] whitespace-nowrap">
              LeadFast <span className="text-[#F5A800]">AI</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#how" className="hover:text-slate-900">How it works</a>
            <Link href="/demo" className="hover:text-slate-900">Demo</Link>
            <a href="#pricing" className="hover:text-slate-900">Pricing</a>
            <a href="#faq" className="hover:text-slate-900">FAQ</a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <Link href="/login" className="text-sm font-semibold text-slate-700 hover:text-slate-900 px-2 py-2">
              Log in
            </Link>
            <Link href={SIGNUP} className="shiny-btn !px-4 !py-2 !text-sm whitespace-nowrap">
              Start free trial
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1" style={{ minHeight: 0 }}>
        {/* Hero */}
        <section className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
          <div className="max-w-6xl mx-auto px-4 py-12 sm:py-20 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div className="space-y-6">
              <p className="inline-block text-xs font-semibold uppercase tracking-widest text-sky-700 bg-sky-50 border border-sky-200 rounded-full px-3 py-1">
                For plumbers, HVAC, electricians, roofers and remodelers
              </p>
              <h1 className="no-underline text-4xl sm:text-5xl font-extrabold leading-tight">
                Answer every new lead in under a minute, even when you&apos;re on a job.
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed">
                Homeowners usually hire whoever gets back to them first. LeadFast AI replies to every website and quote
                request right away, in your business name, then alerts you so you can call back and book the job.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href={SIGNUP} className="shiny-btn !text-base">
                  Start your {TRIAL_DAYS}-day free trial
                </Link>
                <Link
                  href="/demo"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Try the live demo
                </Link>
              </div>
              <p className="text-sm text-slate-500">No credit card. Cancel any time. Set up in about 5 minutes.</p>
            </div>

            {/* Example of what a customer receives */}
            <div className="relative">
              <div className="rounded-2xl bg-white border border-slate-200 shadow-xl p-5 sm:p-6 space-y-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Example</p>
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="font-semibold text-slate-700">Quote request · Sarah M.</span>
                    <span>7:42 PM</span>
                  </div>
                  <p className="text-sm text-slate-700">
                    Hi, our water heater is leaking in the garage. Can someone take a look this week?
                  </p>
                </div>
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
                  <div className="flex items-center justify-between text-xs text-emerald-800 mb-2">
                    <span className="font-semibold">Reply from Rivera Plumbing</span>
                    <span>7:42 PM · 40 seconds later</span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    Hi Sarah, thanks for reaching out to Rivera Plumbing. Sorry to hear about the leaking water heater. Someone
                    from our team will call you shortly to set up a time to take a look. If water is spreading, call us any
                    time at (512) 555-0142.
                  </p>
                </div>
                <div className="rounded-xl bg-sky-50 border border-sky-200 p-3 text-sm text-sky-900">
                  You get an alert with Sarah&apos;s phone number and message at the same moment.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why speed matters */}
        <section className="max-w-6xl mx-auto px-4 py-14 sm:py-20 grid lg:grid-cols-2 gap-10 items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/web/contractors1.webp"
            alt="A contractor on a ladder fixing a kitchen ceiling while the homeowners watch"
            width={1024}
            height={1024}
            loading="lazy"
            className="w-full max-w-md mx-auto rounded-2xl shadow-lg border border-slate-200 object-cover aspect-square"
          />
          <div className="space-y-5">
            <h2 className="no-underline text-3xl font-bold">You can&apos;t answer the phone with your hands full.</h2>
            <ul className="space-y-4 text-slate-600">
              <li className="flex gap-3"><Check /> <span>Requests come in while you&apos;re on a job, driving, or asleep.</span></li>
              <li className="flex gap-3"><Check /> <span>By the time you call back that evening, the customer has often booked someone else.</span></li>
              <li className="flex gap-3"><Check /> <span>LeadFast answers for you in seconds, so the customer knows you&apos;re on it and waits for your call.</span></li>
            </ul>
            <Link href={SIGNUP} className="shiny-btn">Try it free</Link>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="bg-white border-y border-slate-200 scroll-mt-16">
          <div className="max-w-6xl mx-auto px-4 py-14 sm:py-20 space-y-10">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="no-underline text-3xl font-bold !mb-2">How it works</h2>
              <p className="text-slate-600">Three steps, and the first lead can come in the same day.</p>
            </div>
            <ol className="grid md:grid-cols-3 gap-5">
              {STEPS.map((step, i) => (
                <li key={step.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-3">
                  <span className="inline-flex w-9 h-9 items-center justify-center rounded-full bg-[#3B0764] text-white font-bold">
                    {i + 1}
                  </span>
                  <h3 className="no-underline text-lg font-semibold !block">{step.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{step.body}</p>
                </li>
              ))}
            </ol>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES.map(([title, body]) => (
                <div key={title} className="flex gap-3">
                  <Check />
                  <div>
                    <p className="font-semibold text-slate-900">{title}</p>
                    <p className="text-sm text-slate-600 mt-1">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="max-w-6xl mx-auto px-4 py-14 sm:py-20 space-y-10 scroll-mt-16">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="no-underline text-3xl font-bold !mb-2">Simple pricing</h2>
            <p className="text-slate-600">
              Start with a {TRIAL_DAYS}-day free trial with every feature and up to 100 instant replies. No credit card needed.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {plans.map((plan) => {
              const featured = plan.key === 'pro';
              return (
                <div
                  key={plan.key}
                  className={`rounded-2xl bg-white p-6 sm:p-8 space-y-5 border ${featured ? 'border-[#3B0764] shadow-xl' : 'border-slate-200 shadow-sm'}`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold text-slate-900">{plan.name}</p>
                    {featured && (
                      <span className="text-xs font-semibold rounded-full bg-[#F5A800]/20 text-[#7a5200] px-3 py-1">Busiest shops</span>
                    )}
                  </div>
                  <p>
                    <span className="text-4xl font-extrabold text-slate-900">{plan.priceLabel.replace('/mo', '')}</span>
                    <span className="text-slate-500"> / month</span>
                  </p>
                  <ul className="space-y-2.5 text-sm text-slate-700">
                    <li className="flex gap-2.5"><Check />{plan.monthlyReplies === null ? 'Unlimited instant replies' : `${plan.monthlyReplies} instant replies a month`}</li>
                    <li className="flex gap-2.5"><Check />Quote request page and website form capture</li>
                    <li className="flex gap-2.5"><Check />New-lead email alerts</li>
                    <li className="flex gap-2.5"><Check />Lead tracker with revenue won</li>
                    <li className="flex gap-2.5"><Check />Unlimited leads saved, even past your reply limit</li>
                  </ul>
                  <Link href={SIGNUP} className="shiny-btn w-full">
                    Start free trial
                  </Link>
                </div>
              );
            })}
          </div>
          <p className="text-center text-sm text-slate-500">Prices in US dollars. Month to month, cancel any time.</p>
        </section>

        {/* FAQ */}
        <section id="faq" className="bg-white border-y border-slate-200 scroll-mt-16">
          <div className="max-w-3xl mx-auto px-4 py-14 sm:py-20 space-y-8">
            <h2 className="no-underline text-3xl font-bold text-center !block">Questions</h2>
            <div className="divide-y divide-slate-200 border-y border-slate-200">
              {FAQ.map(([q, a]) => (
                <details key={q} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-slate-900">
                    {q}
                    <span className="text-slate-400 transition group-open:rotate-45 text-xl leading-none">+</span>
                  </summary>
                  <p className="mt-3 text-slate-600 leading-relaxed">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="max-w-6xl mx-auto px-4 py-14 sm:py-20">
          <div className="rounded-3xl bg-[#3B0764] px-6 py-12 sm:px-12 text-center space-y-5">
            <p className="text-3xl font-bold text-white">Stop losing jobs to slow replies.</p>
            <p className="text-purple-100 max-w-xl mx-auto">
              Set up your quote link in a few minutes and send yourself a test lead to see what your customers will get.
            </p>
            <Link
              href={SIGNUP}
              className="inline-flex items-center justify-center rounded-lg bg-[#F5A800] px-7 py-3.5 font-bold text-[#2a0550] hover:brightness-105"
            >
              Start your free trial
            </Link>
            <p className="text-sm text-purple-200">
              No credit card needed. Questions first?{' '}
              <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-white underline">
                Book a call with our founder
              </a>
            </p>
          </div>
        </section>
      </main>

      <footer id="contact" className="border-t border-slate-200 bg-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <p className="font-extrabold text-lg text-[#3B0764]">
              LeadFast <span className="text-[#F5A800]">AI</span>
            </p>
            <p className="text-sm text-slate-600 max-w-md">
              Instant replies to every new lead for home service contractors. Built and supported by Ivula Technologies.
            </p>
            <div className="flex items-center gap-3.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/team/bius-founder.webp"
                alt="Bius Michael Joseph, Founder and CEO of Ivula Technologies"
                width={56}
                height={56}
                loading="lazy"
                className="w-14 h-14 rounded-full object-cover border-2 border-white shadow"
              />
              <div className="text-sm">
                <p className="text-xs uppercase text-slate-500">Built by</p>
                <p className="font-semibold text-slate-900">Bius Michael Joseph</p>
                <p className="text-slate-600">Founder &amp; CEO, Ivula Technologies</p>
              </div>
            </div>
          </div>
          <div className="space-y-2 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Support</p>
            <p>
              Email:{' '}
              <a href="mailto:contact@ivula.co.ke" className="text-sky-700 font-medium">contact@ivula.co.ke</a>
            </p>
            <p>
              Phone / WhatsApp:{' '}
              <a href="https://wa.me/254743761460" target="_blank" rel="noopener noreferrer" className="text-sky-700 font-medium">
                +254 743 761 460
              </a>
            </p>
            <p>
              One-on-one call:{' '}
              <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" className="text-sky-700 font-medium">
                Book a Google Meet with Bius
              </a>
            </p>
            <p>Ivula Technologies, Emperor Plaza, 05 Koinange Street, Nairobi, Kenya</p>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 pb-8 flex flex-col sm:flex-row gap-3 justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Ivula Technologies. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-slate-700">Terms</Link>
            <Link href="/privacy" className="hover:text-slate-700">Privacy</Link>
            <Link href="/login" className="hover:text-slate-700">Log in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
