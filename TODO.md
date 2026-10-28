# TODO

## Public navigation and routes

- [ ] হোম ও সকল চাকরির পাশে `প্রস্তুতি`, `সরকারি চাকরি`, `বেসরকারি চাকরি`, `আবেদনের নিয়ম`, `আমাদের সম্পর্কে` এবং `যোগাযোগ` menu দেখাতে হবে; সরকারি ও বেসরকারি menu যথাক্রমে `/jobs?category=govt` এবং `/jobs?category=private`-এ যেতে হবে।
- [ ] `/how-to-apply`, `/about` এবং `/contact` public routes যোগ করতে হবে এবং mobile menu-তেও একই links রাখতে হবে।

## Application guide

- [ ] নতুন account তৈরি, login, CV save, job select, application submit, bKash/Rocket payment proof, TrxID এবং final confirmation—এই ধাপগুলো বাংলায় স্পষ্ট করতে হবে।
- [ ] পেমেন্ট নির্দেশনায় PIN/OTP না শেয়ার করার সতর্কতা এবং নির্দিষ্ট job/application screen-এ প্রদর্শিত verified payment number ব্যবহারের নিয়ম রাখতে হবে।
- [ ] Home page-এ সংক্ষিপ্ত guide section এবং dedicated detailed guide page রাখতে হবে।

## Contact and accessibility

- [ ] `+8801771522503`-এর জন্য floating WhatsApp CTA, accessible label, hover title এবং keyboard focus রাখতে হবে।
- [ ] color contrast, visible keyboard focus, skip-to-content link, reduced-motion এবং forced-colors support যোগ করতে হবে; muted text যেন white background-এ পড়া যায়।

## Delivery and sync

- [ ] নতুন public routes `public/manus-routes.json`-এ declare করতে হবে।
- [ ] TypeScript check ও production build চালিয়ে ফলাফল যাচাই করতে হবে।
- [ ] GitHub `habib-sir/Job-Apply-Website`-এর `main` branch-এ commit/push করে remote sync নিশ্চিত করতে হবে।
