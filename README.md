# Inspire Associates | Staff Daily Work Tracker

<div align="center">
  <img src="public/logo.png" alt="Inspire Associates Logo" width="120" />
  <h3>Growth | Innovation | Trust</h3>
  <p>Internal staff daily task logging, administrative oversight, and operational audit trail system.</p>

  [![Next.js](https://img.shields.io/badge/Next.js-16+-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Prisma](https://img.shields.io/badge/Prisma-6.0+-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
  [![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![PWA Ready](https://img.shields.io/badge/PWA-Installable-purple?style=for-the-badge&logo=pwa)](https://web.dev/progressive-web-apps/)
</div>

---

## 📌 Overview

**Inspire Work Tracker** is a secure, role-based daily operational tracker designed specifically for the team at **Inspire Associates**. It eliminates manual end-of-day reporting by providing a streamlined morning task-planning interface, strict edit safeguards, carry-over rollover mechanisms, administrative task assignment, and complete chronological audit logging.

---

## ✨ Key Features

### 👨‍💻 Staff Workflow
- **Morning Work Planning:** Log tasks at shift start with Title, Description, Category, and Estimated Completion Time.
- **5-Minute Edit Guard:** Staff can modify their task within **5 minutes** of creation. Once the live countdown ends, the task locks automatically to preserve log integrity.
- **Completion Workflow:** Mark jobs completed with summary notes and attach multiple deliverables/links (GitHub PRs, Google Drive, Figma, Docs).
- **Carry-Over / Continuation:** If a job cannot be finished within the day, staff can roll it over to the next day with interim progress and blocker notes.
- **Admin Feedback:** View admin reactions (badges) and instructional replies directly under each task.
- **Account Password Management:** Securely update personal passwords via a modal prompt.

### 🛡️ Administrative Capabilities
- **Real-Time Work Overview:** Monitor all team activity, active tasks, completed works, and carried-over items in real time.
- **Instant Client Filters:** Filter records by individual staff member or date without manual page reloads or submit buttons.
- **Direct Task Allocation:** Assign tasks directly to specific staff members with preset categories and instructions.
- **Exclusive Deletion Rights:** Only Administrators possess the privilege to delete tasks and audit records.
- **Staff Roster Management:** Add new staff members with initial login credentials and remove inactive personnel.
- **Customizable Work Categories:** Add and maintain organizational work categories (e.g., Development, Video Generating, Car Annotation, Exam Paper Adding, Deployments, Social Media).
- **Interactive Feedback:** React to staff submissions with status badges (`👍 Approved`, `🔥 Great Job`, `⚠️ Needs Changes`) and custom comments.

### 🔐 Security & Governance
- **Session Lifespans:**
  - **Staff:** Maximum **12 hours** token duration (forces daily morning re-authentication).
  - **Admin:** **30 days** extended session.
- **Audit Logs:** Tamper-proof activity ledger recording every login, logout, task creation, edit, carry-over, comment, and deletion with user identity and timestamp.
- **PWA Ready:** Installable directly to mobile home screens on Android (Chrome) and iOS (Safari) with a standalone, full-screen native app experience.

---

## 🛠️ Tech Stack

- **Framework:** Next.js (App Router, Server Actions, Turbopack)
- **Language:** TypeScript (Strict Type Safety, zero `any`)
- **Database & Pooling:** PostgreSQL via Supabase (IPv4 Connection Pooler)
- **ORM:** Prisma ORM 6.x
- **Authentication:** Custom stateless JWT with `jose` & HTTP-only secure cookies
- **Styling:** Tailwind CSS with custom Inspire Associates brand colors (`#1a2c5b`, `#0284c7`, `#64748b`)
- **Icons:** Lucide React

---

## 📁 Project Structure

```text
inspire-work-tracker/
├── actions/                  # Next.js Server Actions (Database mutations)
│   ├── admin-actions.ts      # Task deletion & feedback
│   ├── auth-actions.ts       # Login, Logout, Password changes
│   ├── category-actions.ts   # Category creation & deletion
│   ├── staff-actions.ts      # Staff account registration
│   └── task-actions.ts       # Morning logging, 5-min update, Complete, Carry-over
├── app/
│   ├── (auth)/login/         # Branded login interface
│   ├── (dashboard)/
│   │   ├── admin/            # Admin pages (Dashboard, Staffs, Categories, Logs)
│   │   ├── staff/            # Staff daily dashboard
│   │   └── layout.tsx        # Protected dashboard shell
│   ├── manifest.ts           # Dynamic PWA Web Manifest
│   ├── layout.tsx            # Root layout with PWA metadata
│   └── page.tsx              # Role-based root redirect
├── components/               # UI Components
│   ├── AdminAssignTaskModal.tsx
│   ├── ChangePasswordModal.tsx
│   ├── InstantFilter.tsx
│   ├── LogoutModal.tsx       # Custom popup confirmation modal
│   ├── Navbar.tsx            # Responsive desktop & mobile drawer navbar
│   └── StaffTaskCard.tsx     # Live 5-minute countdown & task actions
├── lib/
│   ├── auth.ts               # JWT signing, verification, and cookie helpers
│   └── prisma.ts             # Prisma Client singleton
├── prisma/
│   ├── schema.prisma         # Data models and relations
│   └── seed.ts               # Database initialization script
├── public/
│   └── logo.png              # Inspire Associates branding asset
├── middleware.ts             # Edge session and role route protection
├── next.config.ts            # Server Action CORS & Allowed Origins configuration
└── tailwind.config.ts        # Brand palette definition
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory and add the following keys:

```env
# Supabase Transaction Pooler (Port 6543)
DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Supabase Session Pooler (Port 5432 - Used for Prisma migrations)
DIRECT_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# JWT Secret for Session Verification
JWT_SECRET="your-super-secure-custom-key-string"

# Application Base URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/YOUR_USERNAME/inspire-work-tracker.git
cd inspire-work-tracker
pnpm install
# or: npm install
```

### 2. Synchronize Database
Push the Prisma schema to your Supabase PostgreSQL database:
```bash
npx prisma db push
```

### 3. Seed Default Admin & Categories
Populate the initial Super Admin account and standard work categories:
```bash
npx tsx prisma/seed.ts
```
> **Default Admin Credentials:**
> - **Email:** `admin@inspire.com`
> - **Password:** `********` *(Change this upon initial login)*

### 4. Run Development Server
```bash
npm run dev
# or: pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📱 Progressive Web App (PWA) Installation

- **On Android (Google Chrome):**
  Open the deployed URL. Tap the three dots menu or the prompt banner and select **"Install App"** or **"Add to Home Screen"**.
- **On iOS (Safari):**
  Open the URL in Safari. Tap the **Share** button in the bottom navigation bar and select **"Add to Home Screen"**.

---

## 🚢 Production Deployment (Vercel)

1. Push your repository to GitHub.
2. Import the project on [Vercel](https://vercel.com).
3. Add the 4 environment variables (`DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `NEXT_PUBLIC_APP_URL`) in Vercel's Project Settings.
4. Click **Deploy**. Vercel will build the project using Turbopack and deploy it to a live production URL.

---

## 📄 License & Attribution

Designed and maintained for **Inspire Associates**.  
*Growth | Innovation | Trust*
