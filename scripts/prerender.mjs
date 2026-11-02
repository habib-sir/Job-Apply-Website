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
const publicSlugOf = (job) => {
  const slug = slugOf(job);
  return Buffer.byteLength(slug, 'utf8') <= 160 ? slug : String(job?.id || slug).trim();
};
const routeUrl = (pathValue) => `${BASE}${pathValue.endsWith('/') ? pathValue : `${pathValue}/`}`;
const detailUrl = (job, routeSlug = publicSlugOf(job)) => routeUrl(`/jobs/${encodeURIComponent(routeSlug)}`);
const detailJsonUrl = (job) => `${R2}/jobs/detail/${encodeURIComponent(slugOf(job))}.json`;

async function readJson(url, fallback) {
  try {
    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!response.ok) return fallback;
    return await response.json();
  } catch {
    return fallback;
  }
}

async function enrichJob(job) {
  if (!job || !slugOf(job)) return job;
  const detail = await readJson(detailJsonUrl(job), null);
  return detail && typeof detail === 'object' ? { ...job, ...detail } : job;
}

async function readArchiveJobs() {
  const index = await readJson(`${R2}/jobs/archive/index.json`, []);
  if (!Array.isArray(index)) return [];
  const months = [...new Set(index.map((entry) => entry?.month).filter(Boolean))];
  const lists = await Promise.all(months.map((month) => readJson(`${R2}/jobs/archive/${month}.json`, [])));
  const jobsById = new Map();
  for (const list of lists) {
    if (!Array.isArray(list)) continue;
    for (const job of list) {
      if (job?.id) jobsById.set(String(job.id), { ...job, archived: true });
    }
  }
  return index.map((entry) => jobsById.get(String(entry?.id || ''))).filter(Boolean);
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
    <header style="margin-bottom:28px"><a href="${BASE}/" style="color:#065f46;font-weight:800;text-decoration:none">BD Job Apply</a><nav style="margin-top:12px"><a href="${BASE}/jobs/" style="margin-right:16px;color:#065f46">সকল চাকরি</a><a href="${BASE}/sorkari-chakri/" style="margin-right:16px;color:#065f46">সরকারি চাকরি</a><a href="${BASE}/private-chakri/" style="margin-right:16px;color:#065f46">বেসরকারি চাকরি</a><a href="${BASE}/ngo-chakri/" style="color:#065f46">এনজিও চাকরি</a></nav></header>
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

function categoryJobsBody(jobs, heading, description, label) {
  const items = jobs.map((job) => `<li style="margin:12px 0"><a href="${detailUrl(job)}" style="color:#065f46;font-weight:700">${esc(job.title)}</a><span> — ${esc(label)}, শেষ তারিখ: ${esc(formatDate(job.deadline))}</span></li>`).join('');
  return layout(`<h1>${esc(heading)}</h1><p>${esc(description)}</p><ul>${items}</ul>`);
}

function detailBody(job) {
  const summary = stripHtml(job.content || '').slice(0, 900);
  const salary = job.baseSalary && (job.baseSalary.minValue != null || job.baseSalary.maxValue != null)
    ? `${job.baseSalary.grade ? `${job.baseSalary.grade}, ` : ''}${job.baseSalary.minValue ?? '—'}–${job.baseSalary.maxValue ?? '—'} টাকা (মাসিক)`
    : '';
  const start = job.applicationStartDate ? `<p><strong>আবেদন শুরু:</strong> ${esc(formatDate(job.applicationStartDate))}</p>` : '';
  const pay = salary ? `<p><strong>বেতন:</strong> ${esc(salary)}</p>` : '';
  return layout(`<article><p style="color:#047857;font-weight:700">${esc(job.category === 'govt' ? 'সরকারি চাকরি' : 'চাকরি বিজ্ঞপ্তি')}</p><h1>${esc(job.title)}</h1><p><strong>চাকরির স্থান:</strong> বাংলাদেশ</p>${start}<p><strong>আবেদনের শেষ তারিখ:</strong> ${esc(formatDate(job.deadline))}</p>${pay}<p>${esc(summary)}</p><p><a href="${detailUrl(job)}" style="color:#065f46">বিস্তারিত বিজ্ঞপ্তি ও আবেদনের তথ্য দেখুন</a></p></article>`);
}

function noindexBody(title, message) {
  return layout(`<h1>${esc(title)}</h1><p>${esc(message)}</p>`);
}

function serviceInfoBody(title, intro, sections) {
  const content = sections.map(({ heading, text }) => `<section style="margin:20px 0"><h2>${esc(heading)}</h2><p>${esc(text)}</p></section>`).join('');
  return layout(`<article><h1>${esc(title)}</h1><p>${esc(intro)}</p>${content}</article>`);
}

const faqItems = [
  ['BD Job Apply কী?', 'BD Job Apply সরকারি ও অন্যান্য চাকরির জন্য একটি স্বাধীন, স্বচ্ছ এবং প্রার্থী-কেন্দ্রিক online application assistance platform।'],
  ['আপনারা কি আমার হয়ে চাকরির আবেদন করেন?', 'যেসব বিজ্ঞপ্তিতে application service চালু থাকে, payment verification-এর পর আমাদের team আপনার হয়ে online application প্রস্তুত করে।'],
  ['সব চাকরিতে কি application service চালু থাকে?', 'না। Job details page-এ service status দেখা যাবে। Service বন্ধ থাকলেও circular, যোগ্যতা, deadline এবং official application link দেখা যাবে।'],
  ['Application-এর ধাপগুলো কী?', 'CV Save → Job Select → Fee View → Payment → Waiting → Apply → Check → Complete। ভুল থাকলে Correction request পাঠানো যায়।'],
  ['Teletalk fee এবং service fee কি আলাদা?', 'হ্যাঁ। সরকারি Teletalk application fee এবং BD Job Apply service fee আলাদাভাবে দেখানো হয়। Payment-এর আগে মোট amount দেখে নিন।'],
  ['PDF-তে ভুল থাকলে কী করব?', 'Complete বা confirm না করে Correction request পাঠাতে হবে। সংশোধনের পর নতুন proof দেখানো হবে।'],
  ['আপনারা কি চাকরি পাওয়ার নিশ্চয়তা দেন?', 'না। Application assistance-এর পর selection, পরীক্ষা, ফলাফল ও নিয়োগ সংশ্লিষ্ট কর্তৃপক্ষের সিদ্ধান্তের ওপর নির্ভরশীল।'],
  ['PIN, OTP বা password কি দিতে হবে?', 'না। কোনো staff বা representative-কে payment PIN, OTP, account password বা sensitive banking information দেবেন না।'],
];

function faqBody() {
  const questions = faqItems.map(([question, answer]) => `<details style="border:1px solid #e5e7eb;border-radius:12px;padding:14px;margin:12px 0"><summary style="font-weight:700;cursor:pointer">${esc(question)}</summary><p>${esc(answer)}</p></details>`).join('');
  return layout(`<article><p style="color:#047857;font-weight:700">সহায়তা ও স্বচ্ছতা</p><h1>সচরাচর জিজ্ঞাসিত প্রশ্ন</h1><p>চাকরির আবেদন সহায়তা, payment verification, application proof এবং service fee সম্পর্কে সাধারণ প্রশ্নের উত্তর।</p>${questions}</article>`);
}

function faqSchema() {
  return { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqItems.map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })) };
}

function redirectBody(target) {
  return `<main lang="bn" style="font-family:system-ui;padding:32px 16px"><h1>পৃষ্ঠাটি নতুন ঠিকানায় সরানো হয়েছে</h1><p><a href="${esc(target)}">নতুন ঠিকানায় যেতে এখানে চাপুন</a></p><script>location.replace(${JSON.stringify(target)})</script></main>`;
}

function schemaForHome() {
  return { '@context': 'https://schema.org', '@type': 'WebSite', name: 'BD Job Apply', url: `${BASE}/`, inLanguage: 'bn-BD' };
}

function schemaForJobs() {
  return { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'সকল চাকরির খবর ও নিয়োগ বিজ্ঞপ্তি', url: routeUrl('/jobs'), inLanguage: 'bn-BD' };
}

function inferSalaryFromContent(job) {
  if (job.baseSalary && (job.baseSalary.minValue != null || job.baseSalary.maxValue != null)) return job.baseSalary;
  const digits = (value) => String(value).replace(/[০-৯]/g, (d) => '০১২৩৪৫৬৭৮৯'.indexOf(d)).replace(/,/g, '');
  const text = stripHtml(job.content || '');
  const values = [];
  for (const match of text.matchAll(/(?:বেতন|মাসিক|pay scale|salary)[^।\n]{0,500}/gi)) {
    for (const number of match[0].matchAll(/(?:[০-৯\d]{1,3},(?:[০-৯\d]{2,3},)?[০-৯\d]{3}|[০-৯\d]{4,})/g)) {
      const value = Number(digits(number[0]));
      if (value >= 1000 && value <= 10000000) values.push(value);
    }
  }
  const unique = [...new Set(values)].sort((a, b) => a - b);
  if (!unique.length) return undefined;
  return { currency: 'BDT', minValue: unique[0], maxValue: unique[unique.length - 1], unitText: 'MONTH' };
}

function isGovernmentJob(job) {
  return job.category === 'govt' && !/(ngo|এনজিও|ফাউন্ডেশন|পিকেএসএফ|pksf)/i.test(String(job.title || ''));
}

function organizationForJob(job) {
  if (job.organizationName) return job.organizationName;
  if (/(পিকেএসএফ|pksf)/i.test(String(job.title || ''))) return 'পল্লী কর্ম-সহায়ক ফাউন্ডেশন (PKSF)';
  return isGovernmentJob(job) ? 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার' : 'নিয়োগকারী কর্তৃপক্ষ';
}

function schemaForJob(job) {
  const canonical = detailUrl(job);
  const datePosted = job.publishedAt || job.createdAt;
  const salary = inferSalaryFromContent(job);
  const schemaAddress = { '@type': 'PostalAddress', addressCountry: 'BD', ...(job.location || {}) };
  const schemaSalary = salary && (salary.minValue != null || salary.maxValue != null)
    ? {
        '@type': 'MonetaryAmount',
        currency: salary.currency || 'BDT',
        value: {
          '@type': 'QuantitativeValue',
          ...(salary.minValue != null ? { minValue: salary.minValue } : {}),
          ...(salary.maxValue != null ? { maxValue: salary.maxValue } : {}),
          unitText: salary.unitText || 'MONTH',
        },
      }
    : undefined;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    '@id': `${canonical}#job`,
    url: canonical,
    title: job.title,
    description: stripHtml(job.content || job.title).slice(0, 5000),
    datePosted: datePosted ? new Date(datePosted).toISOString() : undefined,
    validThrough: job.deadline ? new Date(job.deadline).toISOString() : undefined,
    ...(job.employmentType ? { employmentType: job.employmentType } : {}),
    hiringOrganization: { '@type': 'Organization', name: organizationForJob(job) },
    jobLocation: { '@type': 'Place', address: schemaAddress },
    ...(schemaSalary ? { baseSalary: schemaSalary } : {}),
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
  const unique = [...new Map(jobs.map((job) => [String(job.id || slugOf(job)), job])).values()];
  const enriched = await Promise.all(unique.map(enrichJob));
  const archiveJobs = await readArchiveJobs();
  const archiveUnique = [...new Map(archiveJobs.map((job) => [String(job.id || slugOf(job)), job])).values()];
  const enrichedArchive = await Promise.all(archiveUnique.map(enrichJob));
  const allJobs = [...new Map([...enriched, ...enrichedArchive].map((job) => [String(job.id || slugOf(job)), job])).values()];

  const homeDescription = 'বাংলাদেশের সরকারি চাকরির খবর, নিয়োগ বিজ্ঞপ্তি, পদের যোগ্যতা এবং আবেদনের শেষ তারিখ।';
  writeRoute('.', withPageMetadata(template, { title: 'সরকারি চাকরি ও নিয়োগ বিজ্ঞপ্তি | BD Job Apply', description: homeDescription, canonical: `${BASE}/`, schema: schemaForHome(), body: homepageBody(enriched) }));
  writeRoute('jobs', withPageMetadata(template, { title: 'সকল চাকরির খবর ও নিয়োগ বিজ্ঞপ্তি | BD Job Apply', description: 'সরকারি ও অন্যান্য চাকরির সর্বশেষ নিয়োগ বিজ্ঞপ্তি, পদের তথ্য এবং আবেদনের সময়সীমা দেখুন।', canonical: routeUrl('/jobs'), schema: schemaForJobs(), body: jobsBody(enriched) }));
  const governmentJobs = enriched.filter((job) => job.category === 'govt');
  writeRoute('sorkari-chakri', withPageMetadata(template, { title: 'সরকারি চাকরির খবর ও নিয়োগ বিজ্ঞপ্তি ২০২৬ | BD Job Apply', description: 'বাংলাদেশের সরকারি চাকরির সর্বশেষ নিয়োগ বিজ্ঞপ্তি, পদের যোগ্যতা, আবেদন পদ্ধতি ও আবেদনের শেষ তারিখ দেখুন।', canonical: routeUrl('/sorkari-chakri'), schema: { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'সরকারি চাকরির খবর ও নিয়োগ বিজ্ঞপ্তি', url: routeUrl('/sorkari-chakri'), inLanguage: 'bn-BD' }, body: governmentJobsBody(governmentJobs) }));
  const privateJobs = enriched.filter((job) => job.category === 'private');
  const ngoJobs = enriched.filter((job) => job.category === 'ngo' || job.category === 'brac');
  writeRoute('private-chakri', withPageMetadata(template, { title: 'বেসরকারি চাকরির খবর ও নিয়োগ বিজ্ঞপ্তি ২০২৬ | BD Job Apply', description: 'বাংলাদেশের বেসরকারি চাকরির সর্বশেষ নিয়োগ বিজ্ঞপ্তি, পদের যোগ্যতা, বেতন, আবেদন পদ্ধতি ও শেষ তারিখ খুঁজুন।', canonical: routeUrl('/private-chakri'), schema: { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'বেসরকারি চাকরির খবর ও নিয়োগ বিজ্ঞপ্তি', url: routeUrl('/private-chakri'), inLanguage: 'bn-BD' }, body: categoryJobsBody(privateJobs, 'বেসরকারি চাকরির খবর ও নিয়োগ বিজ্ঞপ্তি', 'বাংলাদেশের বেসরকারি চাকরির সর্বশেষ নিয়োগ বিজ্ঞপ্তি, পদের যোগ্যতা, বেতন ও আবেদনের শেষ তারিখ দেখুন।', 'বেসরকারি চাকরি') }));
  writeRoute('ngo-chakri', withPageMetadata(template, { title: 'এনজিও চাকরির খবর ও নিয়োগ বিজ্ঞপ্তি ২০২৬ | BD Job Apply', description: 'বাংলাদেশের এনজিও চাকরির সর্বশেষ নিয়োগ বিজ্ঞপ্তি, পদের যোগ্যতা, বেতন, জেলা ও আবেদনের শেষ তারিখ দেখুন।', canonical: routeUrl('/ngo-chakri'), schema: { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'এনজিও চাকরির খবর ও নিয়োগ বিজ্ঞপ্তি', url: routeUrl('/ngo-chakri'), inLanguage: 'bn-BD' }, body: categoryJobsBody(ngoJobs, 'এনজিও চাকরির খবর ও নিয়োগ বিজ্ঞপ্তি', 'বাংলাদেশের এনজিও চাকরির সর্বশেষ নিয়োগ বিজ্ঞপ্তি, পদের যোগ্যতা, বেতন, জেলা ও আবেদনের শেষ তারিখ দেখুন।', 'এনজিও চাকরি') }));
  writeRoute('about', withPageMetadata(template, { title: 'আমাদের সম্পর্কে | অনলাইন চাকরির আবেদন সহায়তা | BD Job Apply', description: 'BD Job Apply কীভাবে CV সংরক্ষণ, payment verification ও ব্যবহারকারীর অনুমোদনের পর নির্দিষ্ট চাকরিতে online application সহায়তা করে তা জানুন।', canonical: routeUrl('/about'), body: serviceInfoBody('BD Job Apply সম্পর্কে', 'BD Job Apply একটি private online job application assistance platform। ব্যবহারকারীরা CV সংরক্ষণ করে নির্দিষ্ট চালু থাকা সরকারি, বেসরকারি ও NGO চাকরিতে আমাদের সহায়তায় আবেদন করতে পারেন।', [{ heading: 'আমাদের service কীভাবে কাজ করে?', text: 'ব্যবহারকারী circular ও পদ নির্বাচন করে Teletalk fee এবং পদভিত্তিক service fee প্রদান করেন। Payment যাচাইয়ের পর team application প্রস্তুত করে PDF proof পাঠায়। ব্যবহারকারী অনুমোদন করলে final Teletalk payment করে User ID/password SMS ও paid copy দেওয়া হয়।' }, { heading: 'আমাদের স্বচ্ছতার অঙ্গীকার', text: 'BD Job Apply হলো সরকারি ও অন্যান্য চাকরির জন্য একটি স্বাধীন, স্বচ্ছ এবং প্রার্থী-কেন্দ্রিক online application assistance platform। আমরা সংশ্লিষ্ট official circular ও portal অনুসরণ করে নির্দিষ্ট চালু থাকা চাকরিতে আবেদন সহায়তা করি; চূড়ান্ত selection ও নিয়োগ সংশ্লিষ্ট কর্তৃপক্ষের নিজস্ব সিদ্ধান্ত।' }]) }));
  writeRoute('how-to-apply', withPageMetadata(template, { title: 'আবেদনের নিয়ম | BD Job Apply', description: 'CV save, job select, fee view, payment, Waiting, Apply, Check, Complete এবং Correction—চাকরির আবেদন সহায়তার ৯টি ধাপ।', canonical: routeUrl('/how-to-apply'), body: serviceInfoBody('চাকরির আবেদন সহায়তার ৯ ধাপ', 'CV save থেকে paid copy পাওয়া পর্যন্ত BD Job Apply-এর application assistance workflow দেখুন।', [{ heading: 'CV Save থেকে Payment', text: 'CV সংরক্ষণ করুন, চালু থাকা চাকরি ও পদ নির্বাচন করুন, Teletalk fee ও service fee দেখুন এবং verified bKash, Rocket বা Nagad নম্বরে payment পাঠান।' }, { heading: 'Waiting, Apply ও Check', text: 'Team payment যাচাই করে Waiting থেকে Apply status-এ application প্রস্তুত করে। এরপর PDF proof Check করে নাম, জন্মতারিখ, পদ ও অন্যান্য তথ্য যাচাই করুন।' }, { heading: 'Complete ও Correction', text: 'তথ্য সঠিক হলে অনুমোদন দিন; তারপর Teletalk fee payment, User ID/password SMS এবং paid copy দেওয়া হবে। ভুল থাকলে correction note পাঠিয়ে application আবার Apply ধাপে পাঠানো যায়।' }]) }));
  writeRoute('faq', withPageMetadata(template, { title: 'সচরাচর জিজ্ঞাসিত প্রশ্ন | চাকরির আবেদন সহায়তা | BD Job Apply', description: 'BD Job Apply-এর online চাকরির আবেদন সহায়তা, Teletalk fee, payment verification, PDF proof ও correction সম্পর্কে সাধারণ প্রশ্নের উত্তর।', canonical: routeUrl('/faq'), schema: faqSchema(), body: faqBody() }));
  writeRoute('login', withPageMetadata(template, { title: 'লগইন | BD Job Apply', description: 'BD Job Apply অ্যাকাউন্টে লগইন করুন।', canonical: `${BASE}/login`, noindex: true, body: noindexBody('ইউজার লগইন', 'অ্যাকাউন্টে প্রবেশ করতে লগইন করুন।') }));
  writeRoute('register', withPageMetadata(template, { title: 'রেজিস্ট্রেশন | BD Job Apply', description: 'BD Job Apply-এ নতুন অ্যাকাউন্ট তৈরি করুন।', canonical: `${BASE}/register`, noindex: true, body: noindexBody('নতুন অ্যাকাউন্ট তৈরি', 'দ্রুত চাকরির আবেদনের জন্য নিবন্ধন করুন।') }));

  const redirects = [];
  for (const job of allJobs) {
    const legacySlug = slugOf(job);
    const routeSlug = publicSlugOf(job);
    const title = `${job.title} | BDJobApply.site`;
    const description = `${job.title}। চাকরির নিয়োগ বিজ্ঞপ্তি, যোগ্যতা ও আবেদনের শেষ তারিখ: ${formatDate(job.deadline)}।`;
    const canonical = detailUrl(job, routeSlug);
    const schema = schemaForJob(job);
    schema.url = canonical;
    schema['@id'] = `${canonical}#job`;
    writeRoute(path.join('jobs', routeSlug), withPageMetadata(template, { title, description, canonical, type: 'article', schema, body: detailBody(job) }));
    if (legacySlug !== routeSlug) redirects.push(`/jobs/${encodeURIComponent(legacySlug)} ${canonical.replace(BASE, '')} 301`);
    if (legacySlug !== routeSlug && Buffer.byteLength(legacySlug, 'utf8') <= MAX_ROUTE_SEGMENT_LENGTH) {
      writeRoute(path.join('jobs', legacySlug), withPageMetadata(template, { title: 'নতুন ঠিকানায় সরানো হয়েছে | BD Job Apply', description: 'এই চাকরির বিজ্ঞপ্তির নতুন ঠিকানা ব্যবহার করুন।', canonical, noindex: true, body: redirectBody(canonical) }));
    }
  }

  fs.writeFileSync(path.join(DIST, '_redirects'), `${redirects.join('\n')}${redirects.length ? '\n' : ''}`);

  const notFound = withPageMetadata(template, { title: 'পৃষ্ঠা পাওয়া যায়নি | BD Job Apply', description: 'আপনি যে পৃষ্ঠাটি খুঁজছেন তা পাওয়া যায়নি।', canonical: `${BASE}/404.html`, noindex: true, body: noindexBody('৪০৪ — পৃষ্ঠা পাওয়া যায়নি', 'লিংকটি ভুল অথবা বিজ্ঞপ্তিটি সরানো হয়েছে।') });
  fs.writeFileSync(path.join(DIST, '404.html'), notFound);
  console.log(`Prerendered homepage, jobs list, auth pages, 404, and ${enriched.length} job detail pages.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
