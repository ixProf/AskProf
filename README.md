# AskProf (بروف) — Personal AMA & Anonymous Q&A Platform

An encrypted, personal Ask Me Anything (AMA) and anonymous question platform built for **Mahmoud Sayed Mohamed ("Prof")**.

---

## 🌟 Key Features

- **Public AMA Feed**:
  - Bilingual Arabic / English interface with complete RTL/LTR support.
  - Submit questions anonymously or with sender name.
  - Follow-up threading to ask contextual questions linked to past answers.
  - Upvoting / liking published answers.
  - Real-time search and filter (Recent vs Most Liked).

- **Admin Operations Room (`/login`)**:
  - Protected admin portal with password challenge and HMAC session authentication.
  - Review incoming pending questions, publish answers to the public feed, and edit or purge items.
  - Rate-limited against brute-force attacks by IP address.

- **Data & Architecture**:
  - **Framework**: Next.js 16 (App Router, Turbopack) + React 19 + TypeScript.
  - **Database**: Serverless PostgreSQL on [Neon](https://neon.tech) via `@neondatabase/serverless`.
  - **Styling**: Tailored CSS Modules with an editorial obsidian-carbon design.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+
- Neon Postgres Database

### 2. Environment Setup
Copy the example environment file and fill in your credentials:
```bash
cp .env.example .env.local
```

Set the following variables in `.env.local`:
```env
DATABASE_URL=postgresql://user:password@ep-xyz.neon.tech/neondb?sslmode=require
ADMIN_PASSWORD=your-secure-admin-password
SESSION_SECRET=your-random-32-byte-secret-key-here
```

### 3. Database Migration
Apply the database schema and migrate initial data:
```bash
npm run migrate:neon
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the public feed, or [http://localhost:3000/login](http://localhost:3000/login) to access the admin portal.

---

## 🛠️ Build & Production
```bash
npm run build
npm run start
```
