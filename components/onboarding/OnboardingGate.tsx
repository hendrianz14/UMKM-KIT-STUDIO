"use client";

import React, { useEffect, useState } from 'react';
import OnboardingDialog from './OnboardingDialog';

type Status =
  | { loading: true }
  | { loading: false; authenticated: boolean; completed: boolean };

export default function OnboardingGate() {
  const [status, setStatus] = useState<Status>({ loading: true });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch('/api/onboarding', { cache: 'no-store' });
        if (!res.ok) {
          // If unauthenticated or server issue, quietly skip
          setStatus({ loading: false, authenticated: false, completed: true });
          return;
        }
        const json = await res.json();
        if (!ignore) {
          const s = {
            loading: false as const,
            authenticated: Boolean(json?.authenticated),
            completed: Boolean(json?.completed),
          };
          setStatus(s);
          setOpen(s.authenticated && !s.completed);
        }
      } catch {
        if (!ignore) {
          setStatus({ loading: false, authenticated: false, completed: true });
        }
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  if (status.loading) return null;
  if (!open) return null;

  return <OnboardingDialog onClose={() => setOpen(false)} />;
}

