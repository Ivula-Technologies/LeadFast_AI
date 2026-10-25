'use client';

import { useEffect } from 'react';

// Registers /sw.js so phones can install LeadFast and see an offline page.
export default function ServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);
  return null;
}
