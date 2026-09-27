# MAITRI-Setu — Implementation Plan
### Step-by-step build instructions with exact commands, file contents, and completion criteria

---

## 0. How to Use This Document

This is a **linear, step-by-step implementation plan**. Each step has:
- **What to do** — the task
- **Exact commands** — copy-paste ready
- **Files to create/modify** — with exact content or structure
- **Done when** — how to verify the step is complete

An AI agent should execute these steps IN ORDER, one at a time, verifying each before moving to the next.

**Prerequisites:**
- Node.js 18+ installed
- npm 9+ installed
- PostgreSQL running locally (or a Supabase/Render free-tier DB URL)
- Git installed

---

## Phase 1: Project Scaffolding

### Step 1.1 — Create the monorepo structure

```bash
# From the project root (SIH26130/ or maitri-setu/)
mkdir -p frontend backend
```

### Step 1.2 — Scaffold the React frontend with Vite

```bash
cd frontend
npx -y create-vite@latest ./ --template react
npm install
npm install react-router-dom recharts axios
npm install -D tailwindcss @tailwindcss/vite
```

**Configure Tailwind in `vite.config.js`:**
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
})
```

**Replace `src/index.css` with:**
```css
@import "tailwindcss";
```

**Done when:** `npm run dev` starts a React app on http://localhost:3000 with Tailwind working.

### Step 1.3 — Initialize the backend

```bash
cd backend
npm init -y
npm install express cors dotenv jsonwebtoken bcryptjs multer tesseract.js json-rules-engine node-cron
npm install -D prisma nodemon
npx prisma init
```

**Create `backend/src/server.js`:**
```js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`MAITRI-Setu backend running on port ${PORT}`);
});
```

**Update `backend/package.json` scripts:**
```json
{
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "db:migrate": "npx prisma migrate dev",
    "db:seed": "node prisma/seed.js",
    "db:reset": "npx prisma migrate reset --force"
  }
}
```

**Create `backend/.env`:**
```
DATABASE_URL=postgresql://user:password@localhost:5432/maitrisetu
JWT_SECRET=maitri-setu-prototype-secret-key-2025
PORT=5000
```

**Done when:** `npm run dev` starts Express on http://localhost:5000 and `GET /api/health` returns `{ status: "ok" }`.

---

## Phase 2: Database Schema

### Step 2.1 — Write the Prisma schema

**Replace `backend/prisma/schema.prisma` with:**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String        @id @default(uuid())
  name         String
  email        String        @unique
  passwordHash String
  role         String        // "applicant" or "officer"
  createdAt    DateTime      @default(now())
  applications Application[]
}

model Application {
  id             String                 @id @default(uuid())
  userId         String
  user           User                   @relation(fields: [userId], references: [id])
  sector         String
  location       String
  investmentSize String
  stage          String
  status         String                 @default("draft")
  createdAt      DateTime               @default(now())
  updatedAt      DateTime               @updatedAt
  approvals      Approval[]
  incentives     ApplicationIncentive[]
  inspections    Inspection[]
}

model Approval {
  id             String     @id @default(uuid())
  applicationId  String
  application    Application @relation(fields: [applicationId], references: [id])
  departmentName String
  approvalType   String
  status         String     @default("pending")
  alertStatus    String?    // null, "warning", "breached"
  isParallel     Boolean    @default(true)
  slaDeadline    DateTime
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt
  documents      Document[]
}

model Document {
  id               String   @id @default(uuid())
  approvalId       String
  approval         Approval @relation(fields: [approvalId], references: [id])
  fileName         String
  filePath         String
  validationStatus String   @default("pending")
  validationNotes  String?
  uploadedAt       DateTime @default(now())
}

model Incentive {
  id                  String                 @id @default(uuid())
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

model Inspection {
  id                   String      @id @default(uuid())
  applicationId        String
  application          Application @relation(fields: [applicationId], references: [id])
  departmentsInvolved  Json
  scheduledDate        DateTime?
  status               String      @default("pending")
}
```

### Step 2.2 — Run the migration

```bash
cd backend
npx prisma migrate dev --name init
```

**Done when:** Migration completes successfully and `npx prisma studio` shows all tables created.

---

## Phase 3: Seed Mock Data

### Step 3.1 — Create the seed script

**Create `backend/prisma/seed.js`** with:
- 2 users (applicant + officer) with bcrypt-hashed passwords
- 4 incentive schemes
- 3-4 pre-seeded applications in different states (draft, in_progress with warning, in_progress with breach, approved)
- Associated approvals with varying SLA deadlines and statuses
- Associated documents with varying validation statuses

### Step 3.2 — Create the rules data file

**Create `backend/src/mockData/approvalRules.json`** with sector-to-approval mappings:

```json
[
  {
    "sector": "Manufacturing - Non-Polluting",
    "approvals": [
      { "departmentName": "Labour Department", "approvalType": "Factory Licence", "defaultSlaDays": 15, "isParallel": true },
      { "departmentName": "Fire Department", "approvalType": "Fire NOC", "defaultSlaDays": 21, "isParallel": true },
      { "departmentName": "Electricity Board", "approvalType": "Electricity Connection", "defaultSlaDays": 14, "isParallel": true }
    ]
  },
  {
    "sector": "Manufacturing - Polluting",
    "approvals": [
      { "departmentName": "Labour Department", "approvalType": "Factory Licence", "defaultSlaDays": 15, "isParallel": true },
      { "departmentName": "Fire Department", "approvalType": "Fire NOC", "defaultSlaDays": 21, "isParallel": true },
      { "departmentName": "Electricity Board", "approvalType": "Electricity Connection", "defaultSlaDays": 14, "isParallel": true },
      { "departmentName": "MPCB", "approvalType": "Pollution NOC", "defaultSlaDays": 30, "isParallel": false }
    ]
  },
  {
    "sector": "IT/Services",
    "approvals": [
      { "departmentName": "Labour Department", "approvalType": "Factory Licence", "defaultSlaDays": 15, "isParallel": true },
      { "departmentName": "Electricity Board", "approvalType": "Electricity Connection", "defaultSlaDays": 14, "isParallel": true }
    ]
  }
]
```

### Step 3.3 — Create incentive schemes data

**Create `backend/src/mockData/incentiveSchemes.json`:**

```json
[
  {
    "schemeName": "MSME Technology Upgrade Subsidy",
    "description": "Subsidy up to 15% of capital investment for technology upgrades in manufacturing MSMEs.",
    "eligibilityCriteria": { "sectorContains": "Manufacturing", "minInvestment": 500000 }
  },
  {
    "schemeName": "Green Industry Tax Rebate",
    "description": "5-year property tax rebate for certified non-polluting manufacturing units.",
    "eligibilityCriteria": { "sector": "Manufacturing - Non-Polluting", "minInvestment": 1000000 }
  },
  {
    "schemeName": "IT Park Incentive Package",
    "description": "Stamp duty exemption and electricity subsidy for IT/Services units in designated IT parks.",
    "eligibilityCriteria": { "sector": "IT/Services", "minInvestment": 2000000 }
  },
  {
    "schemeName": "Employment Generation Subsidy",
    "description": "Per-employee subsidy for units creating 50+ jobs, any sector.",
    "eligibilityCriteria": { "minInvestment": 5000000 }
  }
]
```

### Step 3.4 — Run the seed

```bash
cd backend
node prisma/seed.js
```

**Done when:** `npx prisma studio` shows populated tables with users, applications, approvals, incentives.

---

## Phase 4: Backend API Routes

Build routes IN THIS ORDER. Each route should be in its own file under `backend/src/routes/`.

### Step 4.1 — Auth Routes (`backend/src/routes/auth.js`)

| Endpoint | Function |
|---|---|
| `POST /api/auth/register` | Hash password with bcrypt, create User record, return JWT |
| `POST /api/auth/login` | Verify email+password, return JWT with `{ userId, role, email }` payload |

**Auth middleware (`backend/src/middleware/auth.js`):**
- Extract JWT from `Authorization: Bearer <token>` header
- Verify token, attach `req.user = { userId, role, email }` to request
- 401 if token missing or invalid

### Step 4.2 — Checklist Route (`backend/src/routes/checklist.js`)

| Endpoint | Function |
|---|---|
| `POST /api/checklist` | Accept `{ sector, location, investmentSize, stage }`, look up rules from `approvalRules.json`, return matching approvals list |

**Implementation:** Use `json-rules-engine` OR simple JSON lookup — the rules data is small enough that a direct filter on the JSON file works and is easier to debug.

### Step 4.3 — Application Routes (`backend/src/routes/applications.js`)

| Endpoint | Function |
|---|---|
| `POST /api/applications` | Create Application + auto-create Approval records from checklist, set `slaDeadline = now + defaultSlaDays` |
| `GET /api/applications/:id` | Return full application with nested approvals, documents, SLA countdown |
| `POST /api/applications/:id/submit` | Change status to `submitted`, mark approvals as `in_progress` |
| `GET /api/applications/:id/sla` | Return SLA countdown per approval (days remaining, alert status) |

### Step 4.4 — Document Upload Route (`backend/src/routes/documents.js`)

| Endpoint | Function |
|---|---|
| `POST /api/applications/:id/documents` | Accept file upload (multer), store to `/uploads`, run basic Tesseract.js OCR, update `validationStatus` |

**Validation logic (simplified for prototype):**
1. Check file is PDF/image (mime type check)
2. Run Tesseract.js OCR on images to extract text
3. Check for required keywords based on approval type (e.g., Fire NOC document should contain "fire", "safety", "noc")
4. Set `validationStatus` to `passed` or `flagged` with `validationNotes`

### Step 4.5 — Incentive Matching Route (`backend/src/routes/incentives.js`)

| Endpoint | Function |
|---|---|
| `GET /api/incentives/match/:applicationId` | Fetch application data, run eligibility criteria against all incentives, return matches |

**Matching logic:**
- Load all incentives from DB
- For each incentive, check if application's `sector` matches and `investmentSize >= minInvestment`
- Return matching incentives
- Optionally auto-create `ApplicationIncentive` records

### Step 4.6 — Officer Routes (`backend/src/routes/officer.js`)

| Endpoint | Function |
|---|---|
| `GET /api/officer/queue` | Return all submitted/in_review applications with approval statuses |
| `GET /api/officer/analytics` | Return aggregates: count by status, count by department, avg days pending |

**Officer-only middleware:** Check `req.user.role === "officer"` before processing.

### Step 4.7 — Inspection Route (`backend/src/routes/inspections.js`)

| Endpoint | Function |
|---|---|
| `GET /api/inspections/:applicationId` | Return scheduled/suggested joint inspection for the application |

### Step 4.8 — SLA Cron Job (`backend/src/services/slaTracker.js`)

```js
const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Run every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  const now = new Date();
  const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

  // Mark warnings (deadline within 2 days)
  await prisma.approval.updateMany({
    where: {
      status: 'in_progress',
      alertStatus: null,
      slaDeadline: { lte: twoDaysFromNow, gt: now }
    },
    data: { alertStatus: 'warning' }
  });

  // Mark breached (deadline passed)
  await prisma.approval.updateMany({
    where: {
      status: 'in_progress',
      alertStatus: { not: 'breached' },
      slaDeadline: { lte: now }
    },
    data: { alertStatus: 'breached' }
  });

  console.log(`[SLA Tracker] Checked at ${now.toISOString()}`);
});
```

**Import and start this in `server.js` after app.listen().**

**Done when:** All endpoints return correct data. Test with Postman/curl.

---

## Phase 5: Frontend Pages

### Step 5.1 — Setup routing and layout

**Create `frontend/src/App.jsx`:**
- React Router with routes for all 7 pages
- Shared layout with navigation sidebar/header
- Auth context provider wrapping the app

**Create `frontend/src/context/AuthContext.jsx`:**
- Store JWT token and user info in state
- Provide `login()`, `logout()`, `isAuthenticated` to child components
- Persist token in localStorage

**Create `frontend/src/api/client.js`:**
- Axios instance with base URL and JWT interceptor
- Auto-attach `Authorization: Bearer <token>` to every request

### Step 5.2 — Login Page (`frontend/src/pages/Login.jsx`)

- Email + password form
- Role selector (applicant/officer) — for demo convenience
- On submit: call `/api/auth/login`, store JWT, redirect based on role
- Styled with Tailwind: dark card, gradient background, MAITRI-Setu branding

### Step 5.3 — Checklist Form Page (`frontend/src/pages/ChecklistForm.jsx`)

- Dropdown for sector: "Manufacturing - Non-Polluting", "Manufacturing - Polluting", "IT/Services"
- Text input for location (district name)
- Number input for investment size
- Dropdown for stage: "New Setup", "Expansion", "Diversification"
- Submit → call `POST /api/checklist` → display returned checklist
- "Create Application" button → call `POST /api/applications` → redirect to document upload

### Step 5.4 — Document Upload Page (`frontend/src/pages/DocumentUpload.jsx`)

- Show one file upload slot per approval item from the checklist
- File input accepts PDF/JPG/PNG
- On upload: call `POST /api/applications/:id/documents`
- Show validation result immediately: green checkmark (passed) or red flag (flagged) with notes
- "Submit Application" button when all documents are uploaded

### Step 5.5 — Applicant Dashboard (`frontend/src/pages/ApplicantDashboard.jsx`)

This is the MOST IMPORTANT page for the demo. It should show:

1. **Application Status Card** — overall status with large badge
2. **Approvals Table** — each approval as a row with:
   - Department name
   - Approval type
   - Status badge (color-coded)
   - SLA countdown (days remaining, color: green/amber/red)
   - Alert icon if warning/breached
3. **Matched Incentives Section** — cards showing suggested government schemes
4. **Renewals Section** — placeholder cards for future renewal tracking

### Step 5.6 — Officer Dashboard (`frontend/src/pages/OfficerDashboard.jsx`)

1. **Application Queue Table** — all submitted applications with status, applicant name, SLA status
2. **Analytics Section** — Recharts charts:
   - Bar chart: applications by department
   - Pie chart: applications by status
   - Metric cards: total applications, avg processing time, breach count
3. Click on any application → navigate to detail view

### Step 5.7 — Officer Application Detail (`frontend/src/pages/OfficerApplicationDetail.jsx`)

- Full application details
- All approvals with status controls (approve/reject buttons for demo)
- Uploaded documents list with validation status
- SLA information

---

## Phase 6: Polish for Demo

### Step 6.1 — Visual polish

- **Color-coded SLA badges:** green (>7 days), amber (2-7 days), red (<2 days/breached)
- **Status badges:** draft (gray), submitted (blue), in_review (amber), approved (green), rejected (red)
- **Animated transitions** on page navigation
- **Loading spinners** for all async operations
- **Toast notifications** for success/error on submit/upload actions
- **MAITRI-Setu logo and branding** in header/sidebar

### Step 6.2 — Responsive layout

- Sidebar navigation on desktop
- Collapsible hamburger menu on mobile
- Cards stack vertically on small screens
- Tables scroll horizontally on small screens

### Step 6.3 — Demo-ready seed data

Ensure the seeded data creates visually interesting states:
- Application "ABC Manufacturing" — fully approved (all green badges)
- Application "XYZ Industries" — in progress, Fire NOC deadline is 1 day away (amber/red)
- Application "PQR Chemicals" — MPCB approval breached SLA (red alert, blinking)
- Application "TechStart IT" — draft, not yet submitted

### Step 6.4 — Error handling

- API errors show user-friendly toast messages
- Network errors show retry option
- Invalid routes redirect to login or 404 page
- Empty states show helpful illustrations/messages

---

## Phase 7: Deployment (Optional — for demo)

### Step 7.1 — Frontend deployment (Vercel)

```bash
cd frontend
npm run build  # verify build succeeds
# Push to GitHub, connect repo to Vercel
# Set environment variable: VITE_API_URL=https://your-backend.render.com
```

### Step 7.2 — Backend deployment (Render)

1. Push to GitHub
2. Create new Web Service on Render.com
3. Set environment variables: `DATABASE_URL`, `JWT_SECRET`, `PORT`
4. Build command: `npm install && npx prisma migrate deploy`
5. Start command: `node src/server.js`

### Step 7.3 — Database (Supabase or Render PostgreSQL)

1. Create free PostgreSQL instance
2. Copy connection string to `DATABASE_URL` environment variable
3. Run migrations: `npx prisma migrate deploy`
4. Run seed: `node prisma/seed.js`

---

## Quick Reference: Full File Tree

```
maitri-setu/  (or SIH26130/)
├── .AGENTS/
│   ├── 01_SIH_PPT_Content_ImagePrompts.md
│   ├── 02_Problem_and_Solution.md
│   ├── 03a_Technical_Implementation_FullDepth.md
│   ├── 03b_Technical_Implementation_HighLevel.md
│   ├── 04_AI_Build_Instructions.md
│   ├── 05_Decision_Document.md          ← YOU ARE HERE (decisions)
│   └── 06_Implementation_Plan.md        ← THIS FILE (build steps)
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js                ← Axios instance + JWT interceptor
│   │   ├── context/
│   │   │   └── AuthContext.jsx          ← Auth state management
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   ├── SLACountdown.jsx
│   │   │   ├── IncentiveCard.jsx
│   │   │   └── Toast.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── ChecklistForm.jsx
│   │   │   ├── DocumentUpload.jsx
│   │   │   ├── ApplicantDashboard.jsx
│   │   │   ├── OfficerDashboard.jsx
│   │   │   └── OfficerApplicationDetail.jsx
│   │   ├── App.jsx
│   │   └── index.css                    ← @import "tailwindcss"
│   ├── vite.config.js
│   └── package.json
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── middleware/
│   │   │   └── auth.js                  ← JWT verification middleware
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── checklist.js
│   │   │   ├── applications.js
│   │   │   ├── documents.js
│   │   │   ├── incentives.js
│   │   │   ├── officer.js
│   │   │   └── inspections.js
│   │   ├── services/
│   │   │   ├── rulesEngine.js
│   │   │   ├── preValidation.js
│   │   │   ├── workflowOrchestrator.js
│   │   │   ├── slaTracker.js
│   │   │   ├── incentiveMatcher.js
│   │   │   └── analyticsService.js
│   │   ├── mockData/
│   │   │   ├── approvalRules.json
│   │   │   └── incentiveSchemes.json
│   │   └── server.js
│   ├── uploads/                          ← Document uploads directory
│   ├── .env
│   └── package.json
└── README.md
```

---

## Quick Reference: npm Dependencies

### Frontend (`frontend/package.json`)
```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "react-router-dom": "^6.x",
    "recharts": "^2.x",
    "axios": "^1.x"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.x",
    "vite": "^6.x",
    "tailwindcss": "^4.x",
    "@tailwindcss/vite": "^4.x"
  }
}
```

### Backend (`backend/package.json`)
```json
{
  "dependencies": {
    "express": "^4.x",
    "cors": "^2.x",
    "dotenv": "^16.x",
    "jsonwebtoken": "^9.x",
    "bcryptjs": "^2.x",
    "multer": "^1.x",
    "tesseract.js": "^5.x",
    "json-rules-engine": "^6.x",
    "node-cron": "^3.x",
    "@prisma/client": "^5.x"
  },
  "devDependencies": {
    "prisma": "^5.x",
    "nodemon": "^3.x"
  }
}
```

---

## Quick Reference: Environment Variables

```env
# Backend (.env)
DATABASE_URL=postgresql://user:password@localhost:5432/maitrisetu
JWT_SECRET=maitri-setu-prototype-secret-key-2025
PORT=5000

# Frontend (Vite auto-loads VITE_ prefixed vars from .env)
VITE_API_URL=http://localhost:5000  # Only needed if not using Vite proxy
```

---

## Completion Criteria

The prototype is DONE when:

1. ✅ Applicant can log in, fill the checklist form, and get a personalized approval list
2. ✅ Applicant can upload documents per approval and see instant validation feedback
3. ✅ Applicant can submit the application and see it routed to departments
4. ✅ Applicant dashboard shows all approvals with color-coded SLA countdowns
5. ✅ Applicant sees matched incentive schemes on their dashboard
6. ✅ Officer can log in and see a queue of submitted applications with analytics
7. ✅ Officer can click into an application and see full details
8. ✅ SLA tracker marks warnings and breaches automatically
9. ✅ Pre-seeded data shows visually interesting states (green/amber/red)
10. ✅ Everything runs on 100% free, open-source tools

---

*This plan is designed to be handed directly to an AI coding agent. Execute steps in order. Verify each step before proceeding to the next.*
