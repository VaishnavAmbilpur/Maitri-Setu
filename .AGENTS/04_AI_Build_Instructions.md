# AI Build Instructions — MAITRI-Setu Prototype
### Give this file directly to an AI coding agent (e.g. Claude Code, Cursor) to build the prototype

---

## Project Goal
Build a **web-only prototype** called **MAITRI-Setu** — a simplified single-window industrial approval simulator for Maharashtra. It must run entirely on free/open-source tools, be demoable in a browser, and use **mocked department data** (no real government API integration needed).

---

## Tech Stack to Use (do not substitute paid services)
- **Frontend:** React.js + Tailwind CSS + React Router
- **Backend:** Node.js + Express.js
- **Database:** PostgreSQL (use Prisma ORM)
- **Auth:** JWT-based mock login (no real Aadhaar/OTP integration)
- **OCR/Validation:** Tesseract.js
- **Rules Engine:** json-rules-engine (npm package)
- **Workflow Queue:** BullMQ + Redis (if Redis setup is too heavy for prototype timeline, a simple in-memory/DB-based status queue is an acceptable fallback — flag this decision)
- **Charts:** Recharts
- **File Storage:** Local disk storage under `/uploads` (skip MinIO unless time permits)
- **Scheduling:** node-cron for SLA countdown checks

---

## Step-by-Step Build Order

### Step 1 — Project Scaffolding
1. Create a monorepo with two folders: `frontend/` (React app) and `backend/` (Node/Express app)
2. Set up Prisma with PostgreSQL connection
3. Set up basic Express server with CORS enabled for local frontend dev

### Step 2 — Database Schema (Prisma)
Create the following models. Use these exact field sets (types can be adjusted to Prisma conventions):

```
model User {
  id           String   @id @default(uuid())
  name         String
  email        String   @unique
  passwordHash String
  role         String   // "applicant" or "officer"
  createdAt    DateTime @default(now())
  applications Application[]
}

model Application {
  id             String   @id @default(uuid())
  userId         String
  user           User     @relation(fields: [userId], references: [id])
  sector         String
  location       String
  investmentSize String
  stage          String
  status         String   @default("draft") // draft, submitted, in_review, approved, rejected
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  approvals      Approval[]
  incentives     ApplicationIncentive[]
}

model Approval {
  id             String   @id @default(uuid())
  applicationId  String
  application    Application @relation(fields: [applicationId], references: [id])
  departmentName String
  approvalType   String
  status         String   @default("pending") // pending, in_progress, approved, rejected
  isParallel     Boolean  @default(true)
  slaDeadline    DateTime
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  documents      Document[]
}

model Document {
  id               String   @id @default(uuid())
  approvalId       String
  approval         Approval @relation(fields: [approvalId], references: [id])
  fileName         String
  filePath         String
  validationStatus String   @default("pending") // pending, passed, flagged
  uploadedAt       DateTime @default(now())
}

model Incentive {
  id                  String   @id @default(uuid())
  schemeName          String
  eligibilityCriteria Json
  description         String
  applications        ApplicationIncentive[]
}

model ApplicationIncentive {
  id            String      @id @default(uuid())
  applicationId String
  application   Application @relation(fields: [applicationId], references: [id])
  incentiveId   String
  incentive     Incentive   @relation(fields: [incentiveId], references: [id])
  matchedAt     DateTime    @default(now())
}
```

### Step 3 — Seed Mock Data
Create a seed script that inserts:
- 2 mock users: one applicant, one officer
- A rules dataset (JSON file) mapping `sector + investmentSize` → list of required `{departmentName, approvalType, defaultSlaDays}`. Example sectors: "Manufacturing - Non-Polluting", "Manufacturing - Polluting", "IT/Services". Include departments: MPCB (Pollution NOC), Fire Department (Fire NOC), Labour Department (Factory Licence), Electricity Board (Connection Approval)
- 3–4 sample incentive schemes with simple eligibility criteria (e.g., `{sector: "Manufacturing", minInvestment: 1000000}`)

### Step 4 — Backend API (build in this order)
1. `POST /api/auth/login` — accepts email + password, returns JWT + role
2. `POST /api/auth/register` — simple registration for demo users
3. `POST /api/checklist` — accepts `{sector, location, investmentSize, stage}`, runs rules engine against seeded rules, returns list of required approvals
4. `POST /api/applications` — creates an Application record + auto-creates related Approval records (from checklist) with `slaDeadline` calculated from today + defaultSlaDays
5. `POST /api/applications/:id/documents` — accepts file upload (per approval), runs Tesseract.js OCR/basic validation (check file exists, is PDF/image, required fields present in a simple mock sense), updates `validationStatus`
6. `POST /api/applications/:id/submit` — changes application status to "submitted", marks approvals as "in_progress", determines `isParallel` per approval (simple rule: if approval type has no listed dependency, `isParallel = true`)
7. `GET /api/applications/:id` — returns full application with nested approvals + documents + SLA countdown per approval
8. `GET /api/incentives/match/:applicationId` — runs incentive eligibility rules against application data, returns matched incentives
9. `GET /api/officer/queue` — returns all submitted applications with approval statuses, for officer view
10. `GET /api/officer/analytics` — returns simple aggregates: count of applications by status, count of approvals by department, average days pending per department (compute from seeded/mock data)
11. Background job (`node-cron`, runs every X minutes) — checks all `in_progress` approvals; if `slaDeadline` is within 2 days or passed, set a flag/field `alertStatus: "warning"|"breached"` on the Approval record

### Step 5 — Frontend Pages (build in this order)
1. **Login page** — simple email/password form, role selector (applicant/officer) for demo convenience
2. **Applicant: Checklist Form page** — form for sector/location/investmentSize/stage → calls `/api/checklist` → displays generated checklist
3. **Applicant: Document Upload page** — one upload slot per approval item; shows pass/flag status immediately after upload
4. **Applicant: Submit & Confirmation page** — review screen → submit button → calls `/api/applications/:id/submit`
5. **Applicant: Unified Dashboard** — single page showing: all approvals with status badges + SLA countdown (color-coded: green >7 days, amber 2–7 days, red <2 days/breached), matched incentives section, renewals section (can be static placeholder for prototype)
6. **Officer: Login/Dashboard** — table of submitted applications with status, SLA countdown, and a simple bar/pie chart (Recharts) showing applications by department and by status
7. **Officer: Application Detail view** — click into an application, see full approval breakdown and documents

### Step 6 — Polish for Demo Video
- Add color-coded status badges (green/amber/red) — this is the most visually convincing part of the demo
- Add a loading spinner / toast notifications for actions (submit, upload)
- Seed at least 3–4 sample applications in different states (one fully approved, one in-progress with a near-deadline, one breached) so the demo has visually interesting data to show without needing to wait in real time

---

## What to Explicitly Skip (do not build these — out of scope for prototype)
- Real Aadhaar/DigiLocker integration
- Real MAITRI/MPCB/Fire department API calls
- Real SMS/email sending (use in-app banner/toast instead)
- Mobile app / native app
- Payment gateway integration
- Multi-language support (English only is fine for prototype)

---

## Suggested First Prompt to Give the AI Agent

> "Set up a monorepo with `frontend/` (React + Vite + Tailwind) and `backend/` (Node + Express + Prisma + PostgreSQL). Initialize the Prisma schema using the models defined in this document. Add a seed script with mock users, rules data, and incentive schemes as described. Confirm the schema and seed data before building any API routes."

Then proceed module by module (Step 4 → Step 5) rather than asking the AI to build everything in one shot — this keeps output reviewable and reduces errors.

---

## Environment Variables Needed
```
DATABASE_URL=postgresql://user:password@localhost:5432/maitrisetu
JWT_SECRET=any-random-string-for-prototype
PORT=5000
```

---

*Hand this file directly to your AI coding assistant as the build spec. Pair it with `03_Technical_Implementation.md` if the agent needs the architecture/flow diagrams for additional context.*
