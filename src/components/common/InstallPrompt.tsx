import React, { useEffect, useState } from 'react';
import { Download, X, Share, Plus, MoreVertical } from 'lucide-react';

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const DISMISS_KEY = 'install_prompt_dismissed_at';
const DISMISS_MS = 3 * 24 * 60 * 60 * 1000; // বন্ধ করলে ৩ দিন আর দেখাবে না

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;

const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);

const recentlyDismissed = () => Date.now() - Number(localStorage.getItem(DISMISS_KEY) || 0) < DISMISS_MS;

export const InstallPrompt: React.FC = () => {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [mode, setMode] = useState<'hidden' | 'install' | 'ios' | 'manual'>('hidden');
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (isStandalone() || recentlyDismissed()) return;

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
      setMode('install');
    };
    const onInstalled = () => {
      setMode('hidden');
      setDeferred(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);

    // iPhone-এ কোনো ইনস্টল প্রম্পট নেই, তাই নির্দেশনা দেখাই
    let timer: number | undefined;
    if (isIOS()) {
      timer = window.setTimeout(() => setMode('ios'), 2500);
    } else {
      // Android/Desktop: প্রম্পট না এলে ম্যানুয়াল নির্দেশনা
      timer = window.setTimeout(() => setMode((m) => (m === 'hidden' ? 'manual' : m)), 6000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setMode('hidden');
  };

  const install = async () => {
    if (!deferred) return;
    setInstalling(true);
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === 'accepted') {
        setMode('hidden');
      } else {
        dismiss();
      }
    } finally {
      setDeferred(null);
      setInstalling(false);
    }
  };

  if (mode === 'hidden') return null;

  return (
    <div className="fixed left-3 right-3 bottom-20 md:bottom-4 md:left-auto md:right-4 md:w-96 z-[60] bg-slate-900 text-white rounded-2xl shadow-2xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold">অ্যাপ হিসেবে ইনস্টল করুন</p>
            <p className="text-[11px] text-slate-300">চাকরির বিজ্ঞপ্তি ও প্রস্তুতি এক ট্যাপে পান</p>
          </div>
        </div>
        <button type="button" onClick={dismiss} className="p-1 text-slate-400 hover:text-white" aria-label="বন্ধ করুন">
          <X className="w-4 h-4" />
        </button>
      </div>

      {mode === 'install' && (
        <button
          type="button"
          onClick={install}
          disabled={installing}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 rounded-lg text-sm font-bold"
        >
          <Download className="w-4 h-4" />
          <span>{installing ? 'ইনস্টল হচ্ছে...' : 'ইনস্টল করুন'}</span>
        </button>
      )}

      {mode === 'ios' && (
        <ol className="text-xs text-slate-200 space-y-1.5 list-decimal list-inside">
          <li>নিচে <Share className="inline w-3.5 h-3.5" /> <strong>Share</strong> বোতামে চাপুন</li>
          <li><Plus className="inline w-3.5 h-3.5" /> <strong>Add to Home Screen</strong> নির্বাচন করুন</li>
          <li><strong>Add</strong> চাপুন</li>
        </ol>
      )}

      {mode === 'manual' && (
        <ol className="text-xs text-slate-200 space-y-1.5 list-decimal list-inside">
          <li>ব্রাউজারের উপরে ডানদিকে <MoreVertical className="inline w-3.5 h-3.5" /> মেনু খুলুন</li>
          <li><strong>Install app</strong> বা <strong>Add to Home screen</strong> নির্বাচন করুন</li>
        </ol>
      )}
    </div>
  );
};
