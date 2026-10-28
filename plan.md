# BD Job Apply — Navigation, Application Guide & Accessibility Update

## Scope

এই আপডেটে বিদ্যমান React/Vite job application portal-এর public experience উন্নত করা হবে। আগে থেকেই থাকা Firebase authentication, CV profile, application pipeline এবং payment workflow পুনরায় তৈরি না করে সেগুলোর দিকে পরিষ্কার public guidance ও navigation দেওয়া হবে।

## Implementation approach

- `PublicLayout`-এ হোম ও সকল চাকরির পাশে প্রস্তুতি, সরকারি চাকরি, বেসরকারি চাকরি, আবেদন পদ্ধতি, আমাদের সম্পর্কে এবং যোগাযোগ menu যোগ করা হবে। সরকারি/বেসরকারি menu বিদ্যমান `/jobs?category=...` filter ব্যবহার করবে।
- `/how-to-apply`, `/about`, `/contact` নামে lightweight public pages যোগ হবে।
- Home page-এ account তৈরি, login, CV save, job apply, payment এবং final confirmation—এই ধাপগুলো একটি scan-friendly section-এ দেখানো হবে।
- Floating WhatsApp button `+8801771522503`-এ deep link করবে; icon-only button-এর সঙ্গে accessible label ও tooltip থাকবে।
- Accessibility/color issue-এর জন্য global focus-visible ring, keyboard skip link, text selection, reduced motion, forced-colors support এবং stronger neutral text contrast যোগ হবে। আগের green brand identity রাখা হবে, কিন্তু body copy-তে gray-900/gray-700 ব্যবহার করা হবে।
- Public route manifest আপডেট হবে, যাতে নতুন routes crawler/runtime-এর কাছে দৃশ্যমান থাকে।

## Project structure

- `src/layouts/PublicLayout.tsx`: shared public header, responsive menu, footer, floating WhatsApp.
- `src/pages/public/HomePage.tsx`: homepage content এবং application guide section.
- `src/pages/public/HowToApplyPage.tsx`: বিস্তারিত আবেদন নির্দেশিকা ও payment guidance.
- `src/pages/public/AboutPage.tsx`: service scope, transparency, user responsibility.
- `src/pages/public/ContactPage.tsx`: WhatsApp, phone এবং support contact.
- `src/App.tsx`: public route registration.
- `src/index.css`: global accessibility and contrast safeguards.
- `public/manus-routes.json`: complete public page route declaration.

## Design direction

### Considered styles

- **Trust-first civic portal** — 0.04 probability: deep emerald, white surfaces, clear numbered process.
- **Editorial job desk** — 0.06 probability: compact typography and newspaper-like sections.
- **Friendly service concierge** — 0.08 probability: rounded cards, warm accents and conversational copy.

### Chosen style: Trust-first civic portal

- **Design movement:** modern civic service interface with restrained government-portal clarity.
- **Core principles:** obvious next action, transparent payment language, calm information hierarchy, keyboard-friendly controls.
- **Color philosophy:** emerald signals progress and service; navy/charcoal anchors readable text; amber is reserved for caution/payment notes and never used as body text on white.
- **Layout paradigm:** full-width service bands followed by narrow readable content rails; process steps use a vertical rhythm on mobile and an asymmetric numbered row on desktop.
- **Signature elements:** numbered emerald step markers, thin top notice bar, fixed WhatsApp contact action.
- **Interaction philosophy:** every navigation item explains where it leads; cards expose a clear action or next step; hover never carries the only meaning.
- **Animation:** keep transitions short and subtle; honor `prefers-reduced-motion`.
- **Typography system:** Hind Siliguri for Bengali UI; bold display headings, 14–16px readable body copy, 12–13px supporting labels.
- **Brand essence:** dependable Bangladeshi job-application assistance for candidates who want a clear path from circular to submitted application; dependable, practical, transparent.
- **Brand voice:** direct, respectful, reassuring. Example: “একবার সিভি পূরণ করুন, পরের আবেদন সহজ করুন।” / “পেমেন্টের আগে নম্বর ও নির্দেশনা মিলিয়ে নিন।”
- **Wordmark & logo:** existing briefcase mark and Bengali wordmark are retained to avoid visual drift.
- **Signature brand color:** emerald `#047857` with accessible darker interaction state `#065f46`.

## Content and payment safety

Payment instructions will explain bKash/Rocket transaction ID submission and screenshot upload without hard-coding a payment number. Users are told to use only the verified number shown on the selected job/application screen, keep the TrxID, and not share PIN/OTP. Government application fee and service fee are described as separate where applicable.
