'use client';

import { useEffect, useState } from 'react';
import { authHeaders } from '@/lib/session';

type State = 'loading' | 'unavailable' | 'needs-install' | 'off' | 'on' | 'blocked' | 'working';

function urlBase64ToUint8Array(base64: string) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const raw = window.atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

// "New lead alerts": a phone notification the moment a lead arrives, on top
// of the email alert. On iPhone this only works once LeadFast is on the home
// screen (iOS 16.4+), so the card says so instead of offering a dead button.
export default function LeadAlertsCard({ businessId }: { businessId: string }) {
  const [state, setState] = useState<State>('loading');
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
      const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
      const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as Navigator & { standalone?: boolean }).standalone === true;

      const info = await fetch('/api/push').then((r) => r.json()).catch(() => null);
      if (cancelled) return;
      if (!info?.enabled) return setState('unavailable');
      setPublicKey(info.publicKey);
      if (!supported) return setState(ios && !standalone ? 'needs-install' : 'unavailable');
      if (Notification.permission === 'denied') return setState('blocked');

      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      if (!cancelled) setState(existing ? 'on' : 'off');
    })().catch(() => { if (!cancelled) setState('unavailable'); });
    return () => { cancelled = true; };
  }, []);

  async function turnOn() {
    if (!publicKey) return;
    setError('');
    setState('working');
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return setState(permission === 'denied' ? 'blocked' : 'off');
      const reg = await navigator.serviceWorker.ready;
      const sub =
        (await reg.pushManager.getSubscription()) ||
        (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(publicKey) }));
      const res = await fetch('/api/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
        body: JSON.stringify({ business_id: businessId, subscription: sub.toJSON() }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Could not turn on alerts.');
      setState('on');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not turn on alerts.');
      setState('off');
    }
  }

  async function turnOff() {
    setError('');
    setState('working');
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch('/api/push', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setState('off');
    } catch {
      setError('Could not turn off alerts on this device.');
      setState('on');
    }
  }

  if (state === 'loading' || state === 'unavailable') return null;

  return (
    <div className="panel card p-4 sm:p-5 rounded-2xl bg-white/95 border border-slate-200 shadow-lg flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-900 text-sm sm:text-base">
          🔔 New lead alerts on this device {state === 'on' && <span className="badge ml-1">On</span>}
        </p>
        <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
          {state === 'needs-install'
            ? 'On iPhone, add LeadFast to your home screen first (Share, then Add to Home Screen), open it from there, and turn alerts on.'
            : state === 'blocked'
              ? 'Notifications are blocked for LeadFast. Allow them in your phone or browser settings, then reload this page.'
              : state === 'on'
                ? 'Your phone buzzes the moment a new lead comes in, so you can call back while they are still looking.'
                : 'Get a notification the moment a new lead comes in, even when LeadFast is closed.'}
        </p>
        {error && <p className="text-xs sm:text-sm text-red-600 mt-1">{error}</p>}
      </div>
      {(state === 'off' || state === 'working') && (
        <button type="button" disabled={state === 'working'} onClick={turnOn} className="shiny-btn !px-4 !py-2 !text-sm shrink-0 disabled:opacity-60">
          {state === 'working' ? 'Saving…' : 'Turn on alerts'}
        </button>
      )}
      {state === 'on' && (
        <button type="button" data-plain="true" onClick={turnOff} className="text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-700 shrink-0">
          Turn off
        </button>
      )}
    </div>
  );
}
