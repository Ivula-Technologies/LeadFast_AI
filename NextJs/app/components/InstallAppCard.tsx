'use client';

import { useEffect, useState } from 'react';

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'leadfast-install-dismissed';

// Shows "Put LeadFast on your phone" until the app is installed or dismissed.
// Android/Chrome get a one-tap install button; iPhone gets the Share-sheet steps.
export default function InstallAppCard() {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    let dismissed = false;
    try { dismissed = window.localStorage.getItem(DISMISSED_KEY) === '1'; } catch {}
    if (standalone || dismissed) return;

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    // Small screens only: on a desktop the card is noise. Deferred one frame
    // so the first render matches the server's (no card).
    const frame = window.requestAnimationFrame(() => {
      setIsIos(ios);
      if (ios || window.matchMedia('(max-width: 820px)').matches) setVisible(true);
    });

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as InstallPromptEvent);
      setVisible(true);
    };
    const onInstalled = () => setVisible(false);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  function dismiss() {
    setVisible(false);
    try { window.localStorage.setItem(DISMISSED_KEY, '1'); } catch {}
  }

  async function install() {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setVisible(false);
    setPrompt(null);
  }

  if (!visible) return null;

  return (
    <div className="panel card p-4 sm:p-5 rounded-2xl bg-white/95 border border-slate-200 shadow-lg flex items-start gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icon-192.png" alt="" width={44} height={44} className="rounded-xl shrink-0" />
      <div className="flex-1 min-w-0 space-y-1.5">
        <p className="font-semibold text-slate-900 text-sm sm:text-base">Put LeadFast on your phone</p>
        {prompt ? (
          <p className="text-xs sm:text-sm text-slate-600">Open your leads in one tap from your home screen, like any other app.</p>
        ) : isIos ? (
          <p className="text-xs sm:text-sm text-slate-600">
            In Safari, tap the <strong>Share</strong> button, then <strong>Add to Home Screen</strong>. LeadFast opens full screen, straight to your leads.
          </p>
        ) : (
          <p className="text-xs sm:text-sm text-slate-600">
            In your browser menu, tap <strong>Install app</strong> or <strong>Add to Home screen</strong>. LeadFast opens full screen, straight to your leads.
          </p>
        )}
        <div className="flex gap-3 items-center pt-0.5">
          {prompt && (
            <button type="button" onClick={install} className="shiny-btn !px-4 !py-1.5 !text-sm">
              Install app
            </button>
          )}
          <button type="button" data-plain="true" onClick={dismiss} className="text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-700">
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
