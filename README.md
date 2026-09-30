# চাকরি আবেদন সার্ভিস প্ল্যাটফর্ম (Job Application & CV Platform)

বাংলাদেশের সরকারি, আধা-সরকারি ও অন্যান্য চাকরির নিয়োগ বিজ্ঞপ্তি প্রকাশ, চাকরিপ্রার্থীদের ক্যানোনিকাল সিভি প্রস্তুতকরণ, Teletalk অনলাইন আবেদন অটোমেশন ও পেমেন্ট ট্র্যাকিং প্ল্যাটফর্ম।

> ⚡ **সম্পূর্ণ ০ খরচে (Zero Cost Architecture):**
> এই প্রজেক্টটি Firebase-এর কোনো পেইড সার্ভিস (যেমন Firebase Storage, Cloud Functions, Gemini API) ছাড়াই সম্পূর্ণ ফ্রি টায়ারে (Spark Plan) চলার উপযোগী করে তৈরি। সমস্ত মিডিয়া ও ফাইল Firestore-এর `files` কালেকশনে অপ্টিমাইজড Base64 ডাটা হিসেবে সংরক্ষিত হয়।

---

## 📌 মূল ফিচারসমূহ

1. **পাবলিক পোর্টাল (কোটা সাশ্রয়ী ১-রিড ফিড):**
   - প্রতি ভিজিটে মাত্র ১টি রিড: `feed/latest` ডকুমেন্ট থেকে সর্বশেষ ৩০টি বিজ্ঞপ্তির লাইটওয়েট সারাংশ সরাসরি লোড হয়।
   - সব পাবলিক ডেটা ৫ মিনিটের ইন-মেমোরি ক্যাশে সংরক্ষিত থাকে (একই সেশনে অতিরিক্ত কোনো রিড হয় না)।
   - "সকল চাকরি" পেজে পুরনো পোস্টের জন্য `limit(20)` + `startAfter` পেজিনেশন।
   - জরুরি ডেডলাইন সতর্কতা (আজ ও আগামীকাল শেষ হতে যাওয়া সার্কুলার)।
   - বাংলা স্লাগ সাপোর্ট ও SEO মেটাডাটা (`react-helmet-async`)।
   - পরীক্ষার সময়সূচি ও ফলাফল নোটিশ বোর্ড।

2. **প্রার্থী ও সিভি সিস্টেম (`/cv`):**
   - মাস্টার স্পেকের ক্যানোনিকাল ৬৪ জেলা ও উপজেলা ক্যাসকেড ড্রপডাউন।
   - শিক্ষা যোগ্যতা (SSC, HSC, ডিপ্লোমা, অনার্স, মাস্টার্স ও অন্যান্য)।
   - ছবি (300×300, ≤100KB) ও স্বাক্ষর (300×80, ≤60KB) ব্রাউজারে HTML5 Canvas দিয়ে স্বয়ংক্রিয় রিসাইজ ও কম্প্রেশন।
   - ফায়ারস্টোর `files` কালেকশনে ফিক্সড আইডি `{uid}_photo` এবং `{uid}_signature` হিসেবে Base64 ডাটা সংরক্ষিত।
   - প্রোফাইল ডকুমেন্টে শুধুমাত্র বুলিয়ান ফ্ল্যাগ `hasPhoto: true` ও `hasSignature: true` সংরক্ষণ করে সাইজ অত্যন্ত হালকা রাখা হয়।
   - সিভি সম্পূর্ণতার শতকরা হার (Completeness Bar) ও অবশিষ্ট ফিল্ডের রিয়েল-টাইম তালিকা।

3. **৫-ধাপের আবেদন ও পেমেন্ট পাইপলাইন:**
   - **Waiting:** প্রার্থী পেমেন্ট ট্রানজ্যাকশন আইডি (bKash/Rocket) ও ঐচ্ছিক স্ক্রিনশট (অটো কমপ্রেসড ≤150KB, `files/{appId}_screenshot`) দিয়ে আবেদন সাবমিট করেন।
   - **Apply Now:** পেমেন্ট যাচাই শেষে অপারেটর Teletalk পোর্টালে ফর্ম পূরণ করেন। এরপর সফট কপি PDF (≤650KB) অথবা Google Drive লিংক প্রদান করেন।
   - **Check Application:** প্রার্থী তার ড্যাশবোর্ডে সফট কপি দেখে "সব ঠিক আছে" অথবা "সংশোধন দরকার" (নোট সহ) জানাতে পারেন।
   - **Payment Now:** সরকারি ফি টেলিটকের মাধ্যমে পরিশোধের পর চূড়ান্ত পেইড কপি PDF (≤650KB) বা Google Drive লিংক প্রদান।
   - **Applied (Complete):** পেইড কপি সেভ হওয়ার সাথে সাথে পুরনো অস্থায়ী সফট কপি (`files/{appId}_soft`) স্বয়ংক্রিয়ভাবে মুছে যায়। প্রার্থী সরাসরি পেইড কপি ডাউনলোড করতে পারেন।

4. **অ্যাডমিন প্যানেল (`/admin`):**
   - পাইপলাইনের প্রতিটি ধাপে আবেদন ফিল্টারিং ও পরিচালনা।
   - অ্যাডমিন ড্যাশবোর্ডের সংখ্যা `getCountFromServer` দিয়ে রিয়েল-টাইম গণনা (ডকুমেন্ট রিডের কোটা ব্যয় হয় না)।
   - সার্কুলার তৈরি ও সম্পাদনায় কভার ইমেজ (≤100KB, `files/job_{jobId}_cover`) এবং সার্কুলার ড্রাইভ/ওয়েব লিংক সাপোর্ট।
   - অ্যাডমিন পোস্ট প্রকাশ/এডিট/ডিলিট করলে `feed/latest` ডকুমেন্ট অ্যাটমিক ট্রানজ্যাকশনে আপডেট হয়।
   - অনন্য ট্রানজ্যাকশন আইডি ভ্যালিডেশন (ডুপ্লিকেট TrxID সম্পূর্ণ ব্লক)।
   - প্রার্থীকে এক ক্লিকে WhatsApp-এ বার্তা পাঠানোর সুবিধা।
   - File System Access API দিয়ে লোকাল ফোল্ডারে সমস্ত আবেদন JSON ও CSV এক্সপোর্ট (`getFile` দিয়ে প্রার্থীর ছবি ও স্বাক্ষর সহ)।

---

## 🛠 প্রযুক্তি ও ডিপেনডেন্সি

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS
- **Routing:** React Router v7
- **Database & Auth:** Google Firebase (Firestore Database, Firebase Authentication)
- **File Storage:** Firestore `files` collection (Zero Storage Cost)
- **Deployment Support:** Cloudflare Pages (`public/_redirects`), Vercel, Firebase Hosting
- **Icons:** Lucide React
- **Sanitization & Security:** DOMPurify

---

## ⚙️ এনভায়রনমেন্ট ভ্যারিয়েবল (.env)

প্রজেক্টের রুটে `.env` ফাইল তৈরি করুন (বা `.env.example` থেকে কপি করুন):

```bash
# মোবাইল নম্বরকে ভার্চুয়াল Firebase Auth ইমেইলে রূপান্তরের ডোমেন সাফিক্স
VITE_USER_EMAIL_DOMAIN="@users.app.local"

# Firebase কনফিগারেশন (firebase-applet-config.json থাকলে স্বয়ংক্রিয় লোড হয়)
VITE_FIREBASE_API_KEY=""
VITE_FIREBASE_AUTH_DOMAIN=""
VITE_FIREBASE_PROJECT_ID=""
VITE_FIREBASE_MESSAGING_SENDER_ID=""
VITE_FIREBASE_APP_ID=""
VITE_FIREBASE_DATABASE_ID=""
```

---

## 📁 ফাইল স্টোরেজ আর্কিটেকচার (Firestore `files`)

Firebase Storage-এ কোনো বিলিং বা পেইড প্ল্যানের প্রয়োজন নেই। সব ফাইল Firestore-এর `files` কালেকশনে সংরক্ষিত:

| ডকুমেন্টের ধরণ | ফিক্সড ডকুমেন্ট আইডি | সর্বোচ্চ সাইজ | হ্যান্ডলিং ও কম্প্রেশন |
|---|---|---|---|
| প্রার্থীর পাসপোর্ট ছবি | `{uid}_photo` | ≤ 100 KB | ব্রাউজারে ক্যানভাস দিয়ে ৩০০×৩০০ JPEG কমপ্রেস |
| প্রার্থীর স্বাক্ষর | `{uid}_signature` | ≤ 60 KB | ব্রাউজারে ৩০০×৮০ JPEG কমপ্রেস |
| পেমেন্ট স্ক্রিনশট | `{appId}_screenshot` | ≤ 150 KB | স্বয়ংক্রিয় রেশিও কম্প্রেশন |
| সার্কুলার কভার ইমেজ | `job_{jobId}_cover` | ≤ 100 KB | বিস্তারিত পেজে Lazy Loaded |
| সফট কপি আবেদন | `{appId}_soft` | ≤ 650 KB | PDF বা Google Drive লিংক (পেইড কপি সেভে এটি অটো ডিলিট হয়) |
| পেইড কপি আবেদন | `{appId}_paid` | ≤ 650 KB | PDF বা Google Drive লিংক |

> **Google Drive লিংক সমর্থন:** PDF ফাইলের আকার ৬৫০ KB-এর বেশি হলে সিস্টেম ফাইল ব্লক করে এবং "PDF ছোট করুন অথবা Google Drive লিংক দিন" নির্দেশনা দেয়। শুধুমাত্র `drive.google.com` বা `docs.google.com` লিংক গ্রহণ করা হয়।

---

## 🗄️ ফায়ারস্টোর কম্পোজিট ইনডেক্স তালিকা (Composite Indexes)

যদি কোনো বিশেষ ফিল্টারিং বা সর্টিংয়ের জন্য ফায়ারস্টোরে ইনডেক্স প্রয়োজন হয়:

1. **Collection: `jobs`**
   - Fields: `status` (Ascending) + `createdAt` (Descending)
2. **Collection: `applications`**
   - Fields: `status` (Ascending) + `createdAt` (Descending)
3. **Collection: `notifications`**
   - Fields: `uid` (Ascending) + `read` (Ascending) + `createdAt` (Descending)

---

## 🚀 সেটআপ ও রান করার নিয়ম

### ১. ডিপেনডেন্সি ইনস্টল:
```bash
npm install
```

### ২. ডেভেলপমেন্ট সার্ভার চালু:
```bash
npm run dev
# সার্ভার চালু হবে: http://localhost:3000
```

### ৩. প্রোডাকশন বিল্ড:
```bash
npm run build
```

---

## 🔐 কীভাবে প্রথম অ্যাডমিন অ্যাকাউন্ট তৈরি করবেন

1. **Firebase Console**-এ যান:
   - আপনার প্রোজেক্ট নির্বাচন করুন এবং **Authentication** > **Users** ট্যাবে যান।
   - **Add User** বাটনে ক্লিক করে একটি ইমেইল ও পাসওয়ার্ড দিন (যেমন: `admin@studyonlinebd.com`)।
   - তৈরিকৃত ইউজারের **User UID** কপি করে নিন।

2. **Firestore Database**-এ অ্যাডমিন প্রিভিলেজ প্রদান:
   - Firestore Database সেকশনে যান।
   - `admins` নামের কালেকশনে যান।
   - **Add Document**-এ ক্লিক করুন:
     - **Document ID:** ইউজারের কপি করা `UID` পেস্ট করুন।
     - ফিল্ড যোগ করুন:
       - `role`: string -> `admin`
       - `createdAt`: timestamp
   - সেভ করুন।

3. **অ্যাডমিন লগইন:**
   - ব্রাউজারে `/admin/login` ঠিকানায় যান।
   - আপনার নির্ধারিত ইমেইল ও পাসওয়ার্ড প্রদান করে অ্যাডমিন ড্যাশবোর্ডে প্রবেশ করুন।

---

## 🌐 ক্লাউডফ্লেয়ার পেজেস ডিপ্লয়মেন্ট

প্রজেক্টের `public/_redirects` ফাইলটি কনফিগার করা রয়েছে:
```
/* /index.html 200
```
Cloudflare Pages বা Netlify-তে ডিপ্লয় করলে সরাসরি SPA রাউটিং কাজ করবে।
