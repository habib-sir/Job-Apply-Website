import fs from 'node:fs';
import path from 'node:path';

const BASE = 'https://bdjobapply.site';
const R2 = 'https://files.bdjobapply.site';
const DIST = path.resolve('dist');
const LOCAL_JOBS = path.resolve('public/jobs.json');
const MAX_ROUTE_SEGMENT_LENGTH = 200;

const esc = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const jsonForHtml = (value) => JSON.stringify(value).replace(/</g, '\\u003c');

const stripHtml = (value = '') =>
  String(value)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const formatDate = (value) => {
  if (!value) return 'বিজ্ঞপ্তি দেখুন';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'বিজ্ঞপ্তি দেখুন';
  return date.toLocaleDateString('bn-BD');
};

const isPublished = (job) => job && job.status !== 'draft';
const slugOf = (job) => String(job?.slug || job?.id || '').trim();
const detailUrl = (job) => `${BASE}/jobs/${encodeURIComponent(slugOf(job))}`;

async function readJson(url, fallback) {
  try {
    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!response.ok) return fallback;
    return await response.json();
  } catch {
    return fallback;
  }
}

function upsertTitle(html, title) {
  return html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(title)}</title>`);
}

function upsertMeta(html, name, content) {
  const escaped = esc(content);
  const pattern = new RegExp(`<meta\\s+name=["']${name}["'][^>]*>`, 'i');
  const tag = `<meta name="${name}" content="${escaped}" />`;
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace('</head>', `  ${tag}\n</head>`);
}

function upsertProperty(html, property, content) {
  const escaped = esc(content);
  const pattern = new RegExp(`<meta\\s+property=["']${property}["'][^>]*>`, 'i');
  const tag = `<meta property="${property}" content="${escaped}" />`;
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace('</head>', `  ${tag}\n</head>`);
}

function upsertCanonical(html, url) {
  const escaped = esc(url);
  const pattern = /<link\s+rel=["']canonical["'][^>]*>/i;
  const tag = `<link rel="canonical" href="${escaped}" />`;
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace('</head>', `  ${tag}\n</head>`);
}

function replaceRoot(html, body) {
  return html.replace(/<div id="root">[\s\S]*?<\/div>/i, `<div id="root">${body}</div>`);
}

function withPageMetadata(template, { title, description, canonical, type = 'website', noindex = false, schema, body }) {
  let html = template;
  html = upsertTitle(html, title);
  html = upsertMeta(html, 'description', description);
  html = upsertMeta(html, 'robots', noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1');
  html = upsertProperty(html, 'og:type', type);
  html = upsertProperty(html, 'og:title', title);
  html = upsertProperty(html, 'og:description', description);
  html = upsertProperty(html, 'og:url', canonical);
  html = upsertProperty(html, 'og:image', `${BASE}/og-image.jpg`);
  html = upsertCanonical(html, canonical);
  if (schema) {
    html = html.replace('</head>', `  <script type="application/ld+json">${jsonForHtml(schema)}</script>\n</head>`);
  }
  return replaceRoot(html, body);
}

function layout(content) {
  return `<main lang="bn" style="max-width:960px;margin:0 auto;padding:32px 16px;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;color:#111827">
    <header style="margin-bottom:28px"><a href="${BASE}/" style="color:#065f46;font-weight:800;text-decoration:none">BD Job Apply</a><nav style="margin-top:12px"><a href="${BASE}/jobs" style="margin-right:16px;color:#065f46">সকল চাকরি</a><a href="${BASE}/sorkari-chakri" style="color:#065f46">সরকারি চাকরি</a></nav></header>
    ${content}
  </main>`;
}

function homepageBody(jobs) {
  const cards = jobs.slice(0, 9).map((job) => `<article style="border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin:12px 0"><h2 style="font-size:18px;margin:0 0 8px"><a href="${detailUrl(job)}" style="color:#065f46">${esc(job.title)}</a></h2><p style="margin:0;color:#4b5563">${esc(job.category === 'govt' ? 'সরকারি চাকরি' : 'চাকরি বিজ্ঞপ্তি')} · আবেদনের শেষ তারিখ: ${esc(formatDate(job.deadline))}</p></article>`).join('');
  return layout(`<h1>সরকারি চাকরি ও নিয়োগ বিজ্ঞপ্তি</h1><p>বাংলাদেশের সরকারি চাকরির খবর, নিয়োগ বিজ্ঞপ্তি, পদের যোগ্যতা এবং আবেদনের শেষ তারিখ একসাথে দেখুন।</p><h2>সর্বশেষ চাকরির বিজ্ঞপ্তি</h2>${cards}`);
}

function jobsBody(jobs) {
  const items = jobs.map((job) => `<li style="margin:12px 0"><a href="${detailUrl(job)}" style="color:#065f46;font-weight:700">${esc(job.title)}</a><span> — ${esc(job.category === 'govt' ? 'সরকারি চাকরি' : 'অন্যান্য চাকরি')}, শেষ তারিখ: ${esc(formatDate(job.deadline))}</span></li>`).join('');
  return layout(`<h1>সকল চাকরির খবর ও নিয়োগ বিজ্ঞপ্তি</h1><p>সরকারি ও অন্যান্য চাকরির সর্বশেষ প্রকাশিত নিয়োগ বিজ্ঞপ্তি, পদের তথ্য এবং আবেদনের সময়সীমা দেখুন।</p><ul>${items}</ul>`);
}

function governmentJobsBody(jobs) {
  const items = jobs.map((job) => `<li style="margin:12px 0"><a href="${detailUrl(job)}" style="color:#065f46;font-weight:700">${esc(job.title)}</a><span> — আবেদনের শেষ তারিখ: ${esc(formatDate(job.deadline))}</span></li>`).join('');
  return layout(`<h1>সরকারি চাকরির খবর ও নিয়োগ বিজ্ঞপ্তি</h1><p>বাংলাদেশের সরকারি চাকরির সর্বশেষ নিয়োগ বিজ্ঞপ্তি, পদের যোগ্যতা, আবেদন পদ্ধতি এবং আবেদনের শেষ তারিখ দেখুন।</p><ul>${items}</ul>`);
}

function detailBody(job) {
  const summary = stripHtml(job.content || '').slice(0, 900);
  return layout(`<article><p style="color:#047857;font-weight:700">${esc(job.category === 'govt' ? 'সরকারি চাকরি' : 'চাকরি বিজ্ঞপ্তি')}</p><h1>${esc(job.title)}</h1><p><strong>আবেদনের শেষ তারিখ:</strong> ${esc(formatDate(job.deadline))}</p><p>${esc(summary)}</p><p><a href="${detailUrl(job)}" style="color:#065f46">বিস্তারিত বিজ্ঞপ্তি ও আবেদনের তথ্য দেখুন</a></p></article>`);
}

function noindexBody(title, message) {
  return layout(`<h1>${esc(title)}</h1><p>${esc(message)}</p>`);
}

function schemaForHome() {
  return { '@context': 'https://schema.org', '@type': 'WebSite', name: 'BD Job Apply', url: `${BASE}/`, inLanguage: 'bn-BD' };
}

function schemaForJobs() {
  return { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'সকল চাকরির খবর ও নিয়োগ বিজ্ঞপ্তি', url: `${BASE}/jobs`, inLanguage: 'bn-BD' };
}

function schemaForJob(job) {
  const canonical = detailUrl(job);
  const datePosted = job.publishedAt || job.createdAt;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    '@id': `${canonical}#job`,
    url: canonical,
    title: job.title,
    description: stripHtml(job.content || job.title).slice(0, 5000),
    datePosted: datePosted ? new Date(datePosted).toISOString() : undefined,
    validThrough: job.deadline ? new Date(job.deadline).toISOString() : undefined,
    employmentType: 'FULL_TIME',
    hiringOrganization: { '@type': 'Organization', name: job.category === 'govt' ? 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার' : 'নিয়োগকারী কর্তৃপক্ষ' },
    jobLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressCountry: 'BD' } },
  };
  return JSON.parse(JSON.stringify(schema));
}

function writeRoute(relativeDir, html) {
  const dir = path.join(DIST, relativeDir);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
}

async function main() {
  if (!fs.existsSync(path.join(DIST, 'index.html'))) throw new Error('dist/index.html not found; run vite build first');
  const template = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
  const local = fs.existsSync(LOCAL_JOBS) ? JSON.parse(fs.readFileSync(LOCAL_JOBS, 'utf8')) : [];
  const remote = await readJson(`${R2}/jobs.json`, local);
  const jobs = (Array.isArray(remote) ? remote : local).filter(isPublished).filter((job) => slugOf(job));
  const unique = [...new Map(jobs.map((job) => [slugOf(job), job])).values()];

  const homeDescription = 'বাংলাদেশের সরকারি চাকরির খবর, নিয়োগ বিজ্ঞপ্তি, পদের যোগ্যতা এবং আবেদনের শেষ তারিখ।';
  writeRoute('.', withPageMetadata(template, { title: 'সরকারি চাকরি ও নিয়োগ বিজ্ঞপ্তি | BD Job Apply', description: homeDescription, canonical: `${BASE}/`, schema: schemaForHome(), body: homepageBody(unique) }));
  writeRoute('jobs', withPageMetadata(template, { title: 'সকল চাকরির খবর ও নিয়োগ বিজ্ঞপ্তি | BD Job Apply', description: 'সরকারি ও অন্যান্য চাকরির সর্বশেষ নিয়োগ বিজ্ঞপ্তি, পদের তথ্য এবং আবেদনের সময়সীমা দেখুন।', canonical: `${BASE}/jobs`, schema: schemaForJobs(), body: jobsBody(unique) }));
  const governmentJobs = unique.filter((job) => job.category === 'govt');
  writeRoute('sorkari-chakri', withPageMetadata(template, { title: 'সরকারি চাকরির খবর ও নিয়োগ বিজ্ঞপ্তি ২০২৬ | BD Job Apply', description: 'বাংলাদেশের সরকারি চাকরির সর্বশেষ নিয়োগ বিজ্ঞপ্তি, পদের যোগ্যতা, আবেদন পদ্ধতি ও আবেদনের শেষ তারিখ দেখুন।', canonical: `${BASE}/sorkari-chakri`, schema: { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'সরকারি চাকরির খবর ও নিয়োগ বিজ্ঞপ্তি', url: `${BASE}/sorkari-chakri`, inLanguage: 'bn-BD' }, body: governmentJobsBody(governmentJobs) }));
  writeRoute('login', withPageMetadata(template, { title: 'লগইন | BD Job Apply', description: 'BD Job Apply অ্যাকাউন্টে লগইন করুন।', canonical: `${BASE}/login`, noindex: true, body: noindexBody('ইউজার লগইন', 'অ্যাকাউন্টে প্রবেশ করতে লগইন করুন।') }));
  writeRoute('register', withPageMetadata(template, { title: 'রেজিস্ট্রেশন | BD Job Apply', description: 'BD Job Apply-এ নতুন অ্যাকাউন্ট তৈরি করুন।', canonical: `${BASE}/register`, noindex: true, body: noindexBody('নতুন অ্যাকাউন্ট তৈরি', 'দ্রুত চাকরির আবেদনের জন্য নিবন্ধন করুন।') }));

  for (const job of unique) {
    if (Buffer.byteLength(slugOf(job), 'utf8') > MAX_ROUTE_SEGMENT_LENGTH) {
      console.warn(`Prerender: slug too long, SPA fallback রাখা হলো: ${slugOf(job).slice(0, 80)}…`);
      continue;
    }
    const title = `${job.title} | BDJobApply.site`;
    const description = `${job.title}। সরকারি চাকরির নিয়োগ বিজ্ঞপ্তি, যোগ্যতা ও আবেদনের শেষ তারিখ: ${formatDate(job.deadline)}।`;
    writeRoute(path.join('jobs', slugOf(job)), withPageMetadata(template, { title, description, canonical: detailUrl(job), type: 'article', schema: schemaForJob(job), body: detailBody(job) }));
  }

  const notFound = withPageMetadata(template, { title: 'পৃষ্ঠা পাওয়া যায়নি | BD Job Apply', description: 'আপনি যে পৃষ্ঠাটি খুঁজছেন তা পাওয়া যায়নি।', canonical: `${BASE}/404.html`, noindex: true, body: noindexBody('৪০৪ — পৃষ্ঠা পাওয়া যায়নি', 'লিংকটি ভুল অথবা বিজ্ঞপ্তিটি সরানো হয়েছে।') });
  fs.writeFileSync(path.join(DIST, '404.html'), notFound);
  console.log(`Prerendered homepage, jobs list, auth pages, 404, and ${unique.length} job detail pages.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
