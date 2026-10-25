// সার্ভিস ওয়ার্কার: অ্যাপের শেল ও ফাইল ক্যাশ, অফলাইন সাপোর্ট, নীরব আপডেট
// প্রস্তুতির ডেটা (prep-data.json, prep-meta.json) এই ফাইল ধরে না, পেজ নিজে ডিভাইসে রাখে।
// নতুন ডিপ্লয়ে VERSION বদলান (যেমন v3)। পুরনো ক্যাশ নিজে মুছে যাবে।
const VERSION = 'v4';
const SHELL_CACHE = `shell-${VERSION}`;
const RUNTIME_CACHE = `runtime-${VERSION}`;

const SHELL_URLS = ['/', '/index.html', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png'];

const DATA_HOST = 'files.bdjobapply.site';

// এই ডোমেইনগুলোর অনুরোধ কখনো ক্যাশ হবে না (লগইন, ডেটা সেভ)
const PASS_THROUGH_HOSTS = [
  'identitytoolkit.googleapis.com',
  'securetoken.googleapis.com',
  'firestore.googleapis.com',
  'bdjob-worker.masterboom2040.workers.dev',
];

// প্রস্তুতির ডেটা: সার্ভিস ওয়ার্কার এড়িয়ে যাবে, কোনো R2 রিড হবে না
const PREP_FILES = ['prep-data.json', 'prep-meta.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      // একটি ফাইল না থাকলেও install যেন ব্যর্থ না হয়
      await Promise.all(SHELL_URLS.map((u) => cache.add(u).catch(() => null)));
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) {
        if (!key.endsWith(VERSION)) await caches.delete(key);
      }
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (PASS_THROUGH_HOSTS.includes(url.hostname)) return;

  // প্রস্তুতির ডেটা: সরাসরি নেটওয়ার্ক বা পেজের নিজস্ব স্টোর, সার্ভিস ওয়ার্কার নয়
  if (url.hostname === DATA_HOST && PREP_FILES.some((f) => url.pathname.endsWith(f))) return;

  // পেজ খোলা: ক্যাশের শেল তাৎক্ষণিক, পিছনে নতুন সংস্করণ নামায়
    if (req.mode === 'navigate') {
    event.respondWith(navigationNetworkFirst(req));
    return;
  }

  // Vite-এর হ্যাশ করা ফাইল: একবার ক্যাশ হলে বদলায় না
  if (url.origin === self.location.origin && url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirst(req, RUNTIME_CACHE));
    return;
  }

  // জব তালিকা ও অন্যান্য R2 ফাইল: নেটওয়ার্ক আগে, অফলাইনে শেষ কপি
  if (url.hostname === DATA_HOST) {
    event.respondWith(networkFirst(req, RUNTIME_CACHE));
    return;
  }

  // অন্যান্য স্থির ফাইল (আইকন ইত্যাদি)
  if (url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(req, RUNTIME_CACHE));
  }
});

// পেজ খোলা: আগে নেটওয়ার্ক (সর্বশেষ index.html ও তার সঠিক ফাইল নাম), অফলাইনে ক্যাশ
async function navigationNetworkFirst(req) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put('/index.html', res.clone());
    return res;
  } catch {
    const shell = await cache.match('/index.html');
    return shell || Response.error();
  }
}

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  if (hit) return hit;
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    return Response.error();
  }
}

async function networkFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    const hit = await cache.match(req);
    return hit || Response.error();
  }
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  const network = fetch(req)
    .then((res) => {
      if (res.ok) cache.put(req, res.clone());
      return res;
    })
    .catch(() => null);

  if (cached) return cached;
  return (await network) || Response.error();
}
