'use client';

import { useEffect, useState } from 'react';
import { authHeaders } from '@/lib/session';

interface Plan {
  key: 'starter' | 'pro';
  name: string;
  priceLabel: string;
  monthlyReplies: number | null;
  available: boolean;
}

interface Entitlement {
  canAutoReply: boolean;
  state: 'trial' | 'active' | 'trial_ended' | 'inactive' | 'cap_reached';
  plan: Plan['key'] | null;
  trialEndsAt: string | null;
  subscriptionStatus: string | null;
  repliesThisMonth: number;
  monthlyReplies: number | null;
}

function daysLeft(iso: string | null) {
  if (!iso) return 0;
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000));
}

export default function BillingPanel({ businessId }: { businessId: string }) {
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/billing/status?business_id=${encodeURIComponent(businessId)}`, {
        headers: await authHeaders(),
      });
      if (!res.ok || cancelled) return;
      const data = await res.json();
      if (cancelled) return;
      setEntitlement(data.entitlement);
      setPlans(data.plans);
    })().catch(() => {
      if (!cancelled) setError('Could not load billing status.');
    });
    return () => { cancelled = true; };
  }, [businessId]);

  async function go(path: string, body: Record<string, string>, key: string) {
    setBusy(key);
    setError('');
    try {
      const res = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
        body: JSON.stringify({ business_id: businessId, ...body }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.message || 'Something went wrong.');
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setBusy(null);
    }
  }

  if (!entitlement) return null;

  const subscribed = entitlement.state === 'active' || (entitlement.state === 'cap_reached' && entitlement.plan !== null);
  const usage =
    entitlement.monthlyReplies === null
      ? `${entitlement.repliesThisMonth} instant replies sent this month (unlimited)`
      : `${entitlement.repliesThisMonth} of ${entitlement.monthlyReplies} instant replies used this month`;

  let headline = '';
  if (entitlement.state === 'trial') headline = `Free trial: ${daysLeft(entitlement.trialEndsAt)} days left`;
  else if (entitlement.state === 'active') headline = `${plans.find((p) => p.key === entitlement.plan)?.name ?? 'Paid'} plan active`;
  else if (entitlement.state === 'cap_reached') headline = 'Monthly reply limit reached';
  else if (entitlement.state === 'trial_ended') headline = 'Your free trial has ended';
  else headline = 'Subscription inactive';

  const warn = !entitlement.canAutoReply;

  return (
    <div className="panel card p-5 sm:p-6 rounded-2xl bg-white/95 border border-slate-200 shadow-lg space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className={`text-lg sm:text-xl font-bold ${warn ? 'text-amber-700' : 'text-slate-900'}`}>{headline}</h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            {usage}.{' '}
            {warn && 'New leads are still saved and emailed to you, but customers are not getting an instant reply.'}
            {entitlement.state === 'cap_reached' && subscribed && ' Upgrade to Pro under Manage billing for unlimited replies.'}
          </p>
        </div>
        {subscribed && (
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => go('/api/billing/portal', {}, 'portal')}
            className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200 transition cursor-pointer"
          >
            {busy === 'portal' ? 'Opening…' : 'Manage billing'}
          </button>
        )}
      </div>

      {!subscribed && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {plans
            .filter((plan) => plan.key !== entitlement.plan)
            .map((plan) => (
              <div key={plan.key} className="rounded-xl border border-slate-200 p-4 bg-slate-50 flex flex-col gap-2">
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-slate-900">{plan.name}</span>
                  <span className="font-semibold text-sky-700">{plan.priceLabel}</span>
                </div>
                <span className="text-xs sm:text-sm text-slate-600">
                  {plan.monthlyReplies === null ? 'Unlimited instant replies' : `${plan.monthlyReplies} instant replies a month`}
                </span>
                <button
                  type="button"
                  disabled={!plan.available || busy !== null}
                  onClick={() => go('/api/billing/checkout', { plan: plan.key }, plan.key)}
                  className="mt-1 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl text-white shiny-btn disabled:opacity-50 cursor-pointer"
                >
                  {!plan.available ? 'Coming soon' : busy === plan.key ? 'Opening checkout…' : `Choose ${plan.name}`}
                </button>
              </div>
            ))}
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
