# Arabic Language & Cultural Club — Administrative CMS Operating Manual
# আরবি ভাষা ও সংস্কৃতি সংসদ — কেন্দ্রীয় প্রশাসনিক ও ওয়েবসাইট পরিচালনা নির্দেশিকা

**Institution:** Kabi Nazrul Government College, Dhaka (কবি নজরুল সরকারি কলেজ, ঢাকা)  
**Society:** Arabic Language & Cultural Club (نادي اللغة والثقافة العربية)  
**Platform Version:** 1.0.0 (Phase 8 Final QA Edition)  
**Access Portal:** `/admin/login`  

---

## Language Navigation / ভাষা নির্বাচন
- [English Manual](#english-manual)
- [বাংলা নির্দেশিকা (Bangla Guide)](#বাংলা-নির্দেশিকা-bangla-guide)

---

<a name="english-manual"></a>
# English Manual

### 1. Administrative Authentication & Security
1. **Accessing the Portal:**
   - Navigate to `/admin/login`.
   - Enter your authorized administrative email (e.g. `admin@arabicclub.org` or `arabicclubkngc2025@gmail.com`) and master password.
   - System sessions are secured with sliding HTTP-only cryptographic cookies lasting 7 days.
2. **Brute Force Protection:**
   - 5 consecutive failed login attempts trigger an automated 15-minute IP lockout.
3. **Roles & Permissions:**
   - **Super Admin:** Full control over user accounts, audit logs, system backups, and global settings.
   - **Administrator:** Full management across committees, members, events, and content.
   - **Content Editor:** Management of news, gallery albums, resources, publications, and page sections.
   - **Membership Manager:** Processing membership applications and maintaining the student roster.
   - **Event Manager:** Scheduling events, master calendars, and attendee check-ins.

---

### 2. Managing Global Site Identity & Branding (`/admin/settings`)
All changes take effect immediately on public pages without touching code.
1. **Brand & Identity Tab:**
   - Update Organization Title (English & Arabic).
   - Update College Name: `Kabi Nazrul Government College, Dhaka`.
   - Update Mottos, Taglines, and Founding Year.
   - Update Crest Logo and Full Banner URLs.
2. **Navigation Menu Manager Tab:**
   - **Add Menu Item:** Enter English Label, Arabic Label, and URL (`/about`, `/events`, etc.).
   - **Reorder:** Tap the `Up` or `Down` arrows to change menu display order.
   - **Toggle Visibility:** Click the Eye icon to hide/show an item without deleting it.
   - **Delete:** Remove unwanted navigation entries.
3. **Hero & Homepage Tab:**
   - Update the Hero Title, Subtitle, and Call-to-Action buttons (Primary & Secondary).
   - Set background image URL or subtle Islamic pattern.
   - Edit Mission and Vision preview statements.
4. **Contact Coordinates & Social Tab:**
   - Update official email, campus room/department address, and office hours.
   - Provide verified links for Facebook, YouTube, LinkedIn, and Twitter.
5. **Footer & Legal Tab:**
   - Customize footer archival narrative, copyright declaration, and classical literary motto.
6. **Search & Metadata (SEO) Tab:**
   - Configure global meta description, keywords, OpenGraph share preview image, and canonical URL.
7. **Saving Changes:**
   - Click the green **Save Settings** button at the top right. A confirmation toast will announce successful synchronization.

---

### 3. Editing Core Pages & Narrative Sections (`/admin/pages`)
Edit the structured bilingual content for `/about`, `/history`, and `/policies`:
1. Select the page card from the left-hand column.
2. In the right panel, each section (e.g., Mission, Pillars, Milestones) appears with its key.
3. Click **Edit** next to any section to launch the **PageSectionModal**:
   - **Heading & Subtitle:** Set bilingual titles.
   - **Body Paragraphs:** Enter rich narrative descriptions.
   - **List Items / Cards:** Add or reorder repeatable cards with badges, years, and icons.
   - **Statistics Counter:** Add metric counters (e.g., `150+` Active Fellows).
   - **Optional Raw JSON:** Switch to the "Raw JSON" tab for advanced batch import.
4. Click **Save Section**. Next.js on-demand revalidation immediately updates the public page.

---

### 4. Scheduling & Managing Events (`/admin/events`)
1. Click **New Event** to open the event scheduler modal.
2. Provide Event Title (English and Arabic), unique URL slug, category (Seminars, Debates, Competitions), start/end dates, and campus venue.
3. Toggle registration status (`open`, `closed`).
4. Click **Save Event**. The event will appear in the 12-month Annual Plan Calendar and the upcoming event strip on the homepage.
5. To link photo archives after an event concludes, click **Create Photo Album** in the event's action menu.

---

### 5. Media Gallery & Photo Albums (`/admin/gallery`)
1. Click **Create Album** to create an album dossier.
2. Provide Title, Academic Year, Date, and Category.
3. Upload photographs: Drag-and-drop JPEG/PNG/WebP files. The system automatically verifies file magic-bytes, generates WebP thumbnail and large variants, and stores them in persistent disk storage.

---

### 6. News, Announcements & Bulletins (`/admin/news`)
1. Click **New Announcement** to draft a secretarial notice.
2. Choose urgency/priority: `Normal`, `Important`, or `Urgent`.
3. Provide English and Arabic titles and body content.
4. Set status to `Published`. It will appear on the homepage and `/news`.

---

### 7. Learning Resources & Library (`/admin/resources`)
1. Add grammar charts, morphology tables, or vocabulary lexicons.
2. Select Subject Category: Grammar (Nahw), Morphology (Sarf), Rhetoric (Balaghah), Vocabulary, or Conversation.
3. Set Skill Level: Beginner, Intermediate, or Advanced.
4. Upload PDF study guide or link external reference material.

---

### 8. Publications & Periodicals (`/admin/publications`)
1. Upload periodic journal issues (e.g., *Al-Bayan*).
2. Provide Issue Number, Volume, Publication Date, and authenticated PDF document URL.
3. Visitors can both preview the PDF directly in their browser and download the verified edition.

---

### 9. Database Backup & Disaster Recovery
1. **Automated Daily Backups:**
   - The server executes a zero-lock SQLite backup every night at 02:00 AM via systemd timer (`arabic-club-backup.timer`).
   - The last 14 copies are permanently rotated and preserved outside the build directory at `/var/backups/arabic-club/` (or `backups/`).
2. **On-Demand Manual Snapshot:**
   - In `/admin/settings`, open the **Backups & Recovery** tab.
   - Click **Create Database Snapshot Now**.
   - Download the timestamped snapshot to your secure administrative computer.
3. **Restoring a Backup:**
   - Use the CLI tool: `pnpm tsx scripts/restore-sqlite.ts backups/arabic_club_backup_<TIMESTAMP>.db`.

---

<a name="বাংলা-নির্দেশিকা-bangla-guide"></a>
# বাংলা নির্দেশিকা (Bangla Guide)

### ১. অ্যাডমিন প্যানেলে লগইন ও নিরাপত্তা
1. **লগইন ঠিকানা:**
   - ব্রাউজারে `/admin/login` ঠিকানায় যান।
   - আপনার প্রাতিষ্ঠানিক ইমেইল (`admin@arabicclub.org` অথবা `arabicclubkngc2025@gmail.com`) এবং পাসওয়ার্ড প্রদান করুন।
   - নিরাপত্তা নিশ্চিত করতে প্রতিবার লগইন সেশন ৭ দিনের জন্য স্বয়ংক্রিয়ভাবে সক্রিয় থাকে।
2. **অ্যাকাউন্ট লকআউট প্রতিরক্ষা:**
   - পরপর ৫ বার ভুল পাসওয়ার্ড দিলে উক্ত আইপি থেকে ১৫ মিনিটের জন্য লগইন সাময়িকভাবে স্থগিত থাকবে।

---

### ২. ওয়েবসাইটের সার্বিক তথ্য ও ব্র্যান্ডিং পরিবর্তন (`/admin/settings`)
কোডে হাত না দিয়ে অ্যাডমিন প্যানেল থেকেই ওয়েবসাইটের যেকোনো তথ্য তৎক্ষণাৎ আপডেট করা যায়:
1. **Brand & Identity (ব্র্যান্ডিং ও পরিচিতি):**
   - ক্লাবের নাম (ইংরেজি ও আরবি)।
   - কলেজের নাম: `কবি নজরুল সরকারি কলেজ, ঢাকা`।
   - স্লোগান, মূলনীতি ও প্রতিষ্ঠাকাল।
   - অফিশিয়াল লোগো ও ব্যানারের ছবি।
2. **Navigation Menu (মেনু বার পরিবর্তন):**
   - মেনুতে নতুন লিংক যুক্ত করতে পারেন (যেমন: নোটিশ, ফোরাম ইত্যাদি)।
   - `Up` বা `Down` বাটনে চাপ দিয়ে মেনু আইটেমের ক্রম পরিবর্তন করতে পারেন।
   - চোখের আইকনে ক্লিক করে কোনো মেনু মুছে না ফেলেই সাময়িকভাবে লুকিয়ে রাখতে পারেন।
3. **Hero & Homepage (হোমপেজ ব্যানার):**
   - হোমপেজের মূল বড় শিরোনাম, সাবটাইটেল এবং বাটন টেক্সট পরিবর্তন করতে পারেন।
4. **Contact & Social (যোগাযোগ ও সোশ্যাল মিডিয়া):**
   - অফিশিয়াল ইমেইল, ফোন নম্বর এবং ক্যাম্পাসের কক্ষ নম্বর।
   - ফেসবুক পেজ, ইউটিউব চ্যানেল ইত্যাদির লিংক।
5. **Footer & Legal (ফুটার তথ্য):**
   - ওয়েবসাইটের একদম নিচের কপিরাইট টেক্সট এবং বাণী পরিবর্তন করুন।
6. **সংরক্ষণ:**
   - যেকোনো তথ্য পরিবর্তনের পর ওপরের ডানদিকের **Save Settings** বাটনে ক্লিক করুন। সাথে সাথে পুরো ওয়েবসাইটে তা আপডেট হয়ে যাবে।

---

### ৩. পেজের বিষয়বস্তু সম্পাদনা (`/admin/pages`)
`/about`, `/history` ইত্যাদি পেজের সেকশনগুলো পরিবর্তন করার নিয়ম:
1. বাম পাশের তালিকা থেকে কাঙ্ক্ষিত পেজটি নির্বাচন করুন।
2. ডান পাশে সেকশনগুলোর তালিকা আসবে (যেমন: Mission, Pillars, Milestones)।
3. **Edit** বাটনে ক্লিক করলে একটি সহজ ফর্ম আসবে:
   - শিরোনাম ও সাবটাইটেল বাংলায়/ইংরেজিতে লিখুন।
   - মূল বিবরণ বা প্যারাগ্রাফ লিখুন।
   - পরিসংখ্যান কাউন্টার বা বুলেট পয়েন্ট যোগ করুন।
4. **Save Section** এ চাপ দিন; মুহূর্তেই পাবলিক পেজে পরিবর্তন দেখা যাবে।

---

### ৪. ইভেন্ট ও বার্ষিক কর্মপরিকল্পনা (`/admin/events`)
1. নতুন ইভেন্ট তৈরি করতে **New Event** বাটনে ক্লিক করুন।
2. ইভেন্টের নাম, তারিখ, সময়, ক্যাম্পাসের স্থান এবং ক্যাটাগরি (সেমিনার, বিতর্ক, সাংস্কৃতিক অনুষ্ঠান) নির্বাচন করুন।
3. রেজিস্ট্রেশন খোলা রাখতে চান কি না তা নির্ধারণ করে **Save Event** এ চাপ দিন।
4. ইভেন্টটি হোমপেজের আসন্ন ইভেন্ট তালিকায় এবং বার্ষিক ক্যালেন্ডারে স্বয়ংক্রিয়ভাবে প্রদর্শিত হবে।

---

### ৫. ফটো গ্যালারি ও মিডিয়া আর্কাইভ (`/admin/gallery`)
1. **Create Album** বাটনে ক্লিক করে ইভেন্টের জন্য নতুন অ্যালবাম তৈরি করুন।
2. কম্পিউটার থেকে ছবিগুলো ড্র্যাগ করে আপলোড করুন।
3. সিস্টেম স্বয়ংক্রিয়ভাবে ছবির সাইজ অপ্টিমাইজ করে সুরক্ষিত স্টোরেজে সংরক্ষণ করবে।

---

### ৬. নোটিশ ও ঘোষণা (`/admin/news`)
1. **New Announcement** এ ক্লিক করে দাপ্তরিক নোটিশ লিখুন।
2. নোটিশের গুরুত্ব নির্বাচন করুন: সাধারণ, গুরুত্বপূর্ণ বা জরুরি।
3. `Published` স্ট্যাটাসে সেভ করলে তা নোটিশ বোর্ডে চলে আসবে।

---

### ৭. আরবি ভাষা শিক্ষা সামগ্রী (`/admin/resources`)
1. নাহু (ব্যাকরণ), সরফ (শব্দরূপ), বালাগাত (অলঙ্কারশাস্ত্র) ইত্যাদি বিষয়ের সহায়িকা যোগ করুন।
2. শিক্ষার্থীদের মেধা অনুযায়ী লেভেল নির্বাচন করুন: প্রাথমিক, মাধ্যমিক বা উচ্চতর।
3. সহায়িকার পিডিএফ ফাইল আপলোড করুন।

---

### ৮. প্রকাশনা ও সাহিত্য সাময়িকী (`/admin/publications`)
1. ক্লাবের সাময়িকী (যেমন: *আল-বায়ান*) বা গবেষণা প্রকাশনা আপলোড করুন।
2. সংখ্যা নম্বর, প্রকাশের তারিখ এবং পিডিএফ যুক্ত করুন।
3. সাধারণ দর্শনার্থীরা ব্রাউজারেই সরাসরি পড়তে পারবে অথবা ডাউনলোড করতে পারবে।

---

### ৯. ডাটাবেজ ব্যাকআপ ও নিরাপত্তা
1. **দৈনিক স্বয়ংক্রিয় ব্যাকআপ:**
   - প্রতিদিন রাত ২:০০ টায় ডাটাবেজের স্বয়ংক্রিয় ব্যাকআপ তৈরি হয় এবং সর্বশেষ ১৪ দিনের কপি সংরক্ষিত থাকে।
2. **তাত্ক্ষণিক ব্যাকআপ ডাউনলোড:**
   - `/admin/settings` এর **Backups & Recovery** ট্যাবে গিয়ে **Create Database Snapshot Now** এ ক্লিক করে এক ক্লিকে সম্পূর্ণ ডাটাবেজ নিজের কম্পিউটারে নামিয়ে রাখা যায়।
