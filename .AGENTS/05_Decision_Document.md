# MAITRI-Setu — Decision Document
### Every technical decision, tradeoff, and rationale — for AI agent context continuity

---

## 0. Purpose of This Document

This document records **every technical decision** made for the MAITRI-Setu prototype. If you are an AI coding agent picking up this project mid-build, read this file FIRST to understand what was chosen and why — so you don't revisit settled decisions or introduce incompatible choices.

---

## 1. Project Identity

- **Name:** MAITRI-Setu
- **Full Form:** AI-Powered Intelligence Layer for Industrial Approvals & Compliance
- **Context:** SIH (Smart India Hackathon) 2025 prototype
- **What it is:** A web application that sits ON TOP of Maharashtra's existing MAITRI single-window system, adding intelligence features (personalized checklists, document pre-validation, parallel workflow orchestration, SLA tracking, incentive matching, analytics)
- **What it is NOT:** A replacement for MAITRI. We augment, not replace.
- **Two user roles:** Applicant (entrepreneur) and Officer (government official)

---

## 2. Core Architecture Decision

### Decision: Layered intelligence on top of MAITRI (not a new portal)

**Why:**
- Maharashtra already has MAITRI (created under the MAITRI Act 2023) as the statutory single-window system
- Building a competing portal would duplicate legal infrastructure and confuse users
- We add the "smart" parts that a pure transaction portal doesn't have

**How it works in production:**
- MAITRI remains the **system of record** (official application + approval data)
- MAITRI-Setu is the **system of intelligence** (checklists, validation, SLA calc, incentive matches, analytics)
- MAITRI-Setu calls MAITRI's departmental APIs to submit applications and check status

**How it works in the prototype:**
- We use **mocked department data** (seeded JSON/DB tables) standing in for real MAITRI API responses
- The mock layer uses the **exact same request/response shapes** as real integration would, so swapping mocks for real APIs is a drop-in replacement, not a rewrite

---

## 3. Technology Stack Decisions

### 3.1 Frontend: React.js + Vite + Tailwind CSS

| Consideration | Decision | Rationale |
|---|---|---|
| Framework | **React.js 18+** | Most widely supported, largest ecosystem, MIT licensed, free |
| Build tool | **Vite** | Fastest dev server, instant HMR, MIT licensed |
| Styling | **Tailwind CSS 3+** | Rapid UI development, consistent design, MIT licensed |
| Routing | **React Router v6** | De-facto standard for React SPAs, MIT licensed |
| Charts | **Recharts** | React-native charting, MIT licensed, simpler API than Chart.js |

**Rejected alternatives:**
- Next.js — SSR is unnecessary for a prototype SPA, adds complexity
- Angular — steeper learning curve, slower to prototype
- Vue — equally valid but React has more ecosystem support for the libraries we need
- Chart.js — works but Recharts integrates more naturally with React components

### 3.2 Backend: Node.js + Express.js

| Consideration | Decision | Rationale |
|---|---|---|
| Runtime | **Node.js** | Same language as frontend (JS), huge ecosystem, MIT licensed |
| Framework | **Express.js** | Minimal, well-documented, MIT licensed |
| API style | **REST** | Simple, well-understood, sufficient for prototype |

**Rejected alternatives:**
- Python/Django — would work but adds a second language to the stack
- Fastify — faster but less ecosystem support than Express
- GraphQL — overkill for this prototype's data patterns

### 3.3 Database: PostgreSQL + Prisma ORM

| Consideration | Decision | Rationale |
|---|---|---|
| Database | **PostgreSQL 15+** | Best free relational DB, handles structured workflow data perfectly, OSI-approved license |
| ORM | **Prisma** | Type-safe, excellent migration system, schema-first approach, Apache 2.0 licensed |

**Rejected alternatives:**
- SQLite — too limited for concurrent access; not production-realistic
- MongoDB — document DB is wrong paradigm for structured approval/workflow data with relations
- Sequelize — works but Prisma's schema-first approach is cleaner and has better tooling
- TypeORM — viable but Prisma is more actively maintained and better documented

### 3.4 OCR/Document Validation: Tesseract.js

| Consideration | Decision | Rationale |
|---|---|---|
| OCR engine | **Tesseract.js** | Runs in-browser or Node, completely free, Apache 2.0 licensed |
| Validation approach | **Basic mock validation** | Check file exists, is PDF/image, run basic OCR to extract text, check for required keywords |

**Rejected alternatives:**
- Google Cloud Vision — paid, requires API key, not open-source
- AWS Textract — paid, requires AWS account
- Azure Form Recognizer — paid, proprietary

**Important note:** For the prototype, OCR accuracy is NOT critical. The demo shows the feature working; production accuracy would improve with better-trained models or government partnership for template-based extraction.

### 3.5 Rules Engine: json-rules-engine

| Consideration | Decision | Rationale |
|---|---|---|
| Rules engine | **json-rules-engine** (npm) | Lightweight, JSON-based rules, MIT licensed, zero external dependencies |
| What it drives | Checklist generation + incentive matching logic |

**How rules work:**
```json
{
  "conditions": {
    "all": [
      { "fact": "sector", "operator": "equal", "value": "Manufacturing - Polluting" },
      { "fact": "investmentSize", "operator": "greaterThanInclusive", "value": 1000000 }
    ]
  },
  "event": {
    "type": "require-approval",
    "params": {
      "departmentName": "MPCB",
      "approvalType": "Pollution NOC",
      "defaultSlaDays": 30
    }
  }
}
```

### 3.6 Workflow Queue: In-Memory (with BullMQ as future upgrade)

| Consideration | Decision | Rationale |
|---|---|---|
| Queue system | **In-memory status queue via PostgreSQL** | Zero additional infrastructure for prototype |
| Future upgrade | **BullMQ + Redis** | When moving to production, swap in for persistent job queue |

**Why not BullMQ now:**
- Requires running a Redis server
- Extra Docker/setup complexity for a hackathon prototype
- A simple status field in PostgreSQL (`pending → in_progress → approved`) is sufficient for the demo

**How the in-memory approach works:**
- Application submission creates Approval records with status `pending`
- A `node-cron` job runs every few minutes, checks for `in_progress` approvals with approaching deadlines
- Status transitions are simple DB updates, no message queue needed

### 3.7 SLA Scheduling: node-cron

| Consideration | Decision | Rationale |
|---|---|---|
| Scheduler | **node-cron** | Simple, ISC licensed, periodic deadline checks |
| Check frequency | Every 5 minutes (configurable) |

**What it does:**
- Runs periodically in the backend process
- Queries all `in_progress` approvals
- If `slaDeadline` is within 2 days → set `alertStatus: "warning"`
- If `slaDeadline` has passed → set `alertStatus: "breached"`

### 3.8 File Storage: Local Disk

| Consideration | Decision | Rationale |
|---|---|---|
| Storage | **Local disk `/uploads`** | Zero setup, works immediately |
| Future upgrade | **MinIO (self-hosted, S3-compatible)** | When moving to production |

### 3.9 Authentication: JWT Mock Login

| Consideration | Decision | Rationale |
|---|---|---|
| Auth method | **JWT (jsonwebtoken npm)** | MIT licensed, stateless, simple |
| Login flow | Email + password + role selector | Mock only — no real Aadhaar/OTP |
| Token storage | LocalStorage (prototype) | Not production-secure, but fine for demo |

### 3.10 Hosting (Prototype Deployment)

| Service | Purpose | Free Tier Details |
|---|---|---|
| **Vercel** | Frontend hosting | Free hobby tier, auto-deploy from GitHub |
| **Render.com** | Backend hosting | Free web services (spins down after 15min inactivity) |
| **Supabase** or **Render PostgreSQL** | Database | Supabase: 500MB free; Render: 90-day free DB |
| **NIC MeghRaj** (concept only) | Production hosting | Existing government infrastructure, zero new cost |

---

## 4. Data Model Decisions

### 4.1 Core entities and relationships

```
User (1) → (many) Application
Application (1) → (many) Approval
Approval (1) → (many) Document
Application (1) → (many) ApplicationIncentive → (1) Incentive
Application (1) → (many) Inspection
```

### 4.2 Key schema decisions

- **UUID primary keys** — not auto-increment integers, for portability and security
- **`isParallel` boolean on Approval** — determines if this approval can run simultaneously with others
- **`slaDeadline` datetime on Approval** — calculated as `createdAt + defaultSlaDays` from the rules engine
- **`validationStatus` on Document** — `pending | passed | flagged` — set by OCR/validation service
- **`eligibilityCriteria` as JSON on Incentive** — flexible schema for different scheme rules
- **`alertStatus` on Approval** — `null | warning | breached` — set by SLA cron job

### 4.3 Why separate Approval from Application

One Application needs MULTIPLE department clearances (MPCB, Fire, Labour, Electricity, etc.). Each clearance has its own SLA deadline, status, and documents. The `Approval` table models this one-to-many relationship cleanly.

---

## 5. API Design Decisions

### 5.1 RESTful endpoints (not GraphQL)

Simple CRUD + business logic endpoints are sufficient. No complex nested queries that would justify GraphQL overhead.

### 5.2 Endpoint inventory

| Method | Endpoint | Auth Required | Role |
|---|---|---|---|
| POST | `/api/auth/login` | No | Any |
| POST | `/api/auth/register` | No | Any |
| POST | `/api/checklist` | Yes | Applicant |
| POST | `/api/applications` | Yes | Applicant |
| GET | `/api/applications/:id` | Yes | Owner or Officer |
| POST | `/api/applications/:id/documents` | Yes | Applicant |
| POST | `/api/applications/:id/submit` | Yes | Applicant |
| GET | `/api/applications/:id/sla` | Yes | Owner or Officer |
| GET | `/api/incentives/match/:applicationId` | Yes | Applicant |
| GET | `/api/inspections/:applicationId` | Yes | Any |
| GET | `/api/officer/queue` | Yes | Officer |
| GET | `/api/officer/analytics` | Yes | Officer |

### 5.3 Auth middleware

- All endpoints except `/auth/login` and `/auth/register` require a valid JWT in the `Authorization: Bearer <token>` header
- JWT payload contains `{ userId, role, email }`
- Role-based access: officer endpoints check `role === "officer"`

---

## 6. Frontend Design Decisions

### 6.1 Page structure (7 pages)

1. **Login** — email/password form with role selector
2. **Checklist Form** (Applicant) — sector/location/investment form → generates checklist
3. **Document Upload** (Applicant) — one upload slot per approval item
4. **Submit & Confirm** (Applicant) — review screen → submit button
5. **Applicant Dashboard** — unified view: approvals with SLA badges, incentives, renewals
6. **Officer Dashboard** — application queue table + analytics charts
7. **Officer Application Detail** — click-through to see full approval breakdown

### 6.2 Visual design priorities

- **Color-coded SLA badges:** green (>7 days), amber (2-7 days), red (<2 days / breached)
- **Status badges:** draft (gray), submitted (blue), in_review (amber), approved (green), rejected (red)
- **Loading spinners + toast notifications** for async actions
- **Recharts** for officer analytics (bar chart by department, pie chart by status)

### 6.3 State management

- **React Context + useReducer** for auth state (logged-in user, JWT token)
- **Local component state** for form data and API responses
- No Redux/Zustand needed — the app is not complex enough to justify external state management

---

## 7. Mock Data Decisions

### 7.1 Seed users
- 1 applicant: `applicant@demo.com` / `password123`
- 1 officer: `officer@demo.com` / `password123`

### 7.2 Seed rules (sector → approvals mapping)

| Sector | Required Approvals | SLA Days |
|---|---|---|
| Manufacturing - Non-Polluting | Factory Licence (Labour), Fire NOC, Electricity Connection | 15, 21, 14 |
| Manufacturing - Polluting | All above + Pollution NOC (MPCB) | 15, 21, 14, 30 |
| IT/Services | Factory Licence (Labour), Electricity Connection | 15, 14 |

### 7.3 Seed incentives

| Scheme | Eligibility |
|---|---|
| MSME Technology Upgrade Subsidy | sector: Manufacturing, minInvestment: 500000 |
| Green Industry Tax Rebate | sector: Manufacturing - Non-Polluting, minInvestment: 1000000 |
| IT Park Incentive | sector: IT/Services, minInvestment: 2000000 |
| Employment Generation Subsidy | any sector, minInvestment: 5000000 |

### 7.4 Pre-seeded applications (for demo visual variety)

Seed 3-4 applications in different states:
- One fully approved (all green)
- One in-progress with a near-deadline approval (amber warning)
- One with a breached SLA deadline (red alert)
- One in draft state

---

## 8. What Is Explicitly Out of Scope

| Feature | Why excluded |
|---|---|
| Real Aadhaar/DigiLocker auth | Requires government partnership |
| Real MAITRI/department API calls | No API access for hackathon |
| Real SMS/email notifications | Use in-app toasts instead |
| Mobile app | Web-only is sufficient for demo |
| Payment gateway | Not relevant to approval flow |
| Multi-language (Hindi/Marathi) | English only for prototype |
| Real Redis/BullMQ | Over-engineered for prototype |
| MinIO file storage | Local disk is sufficient |
| WebSocket real-time updates | Polling/refresh is fine for demo |

---

## 9. Open-Source Verification Summary

**Every single technology is verified free and open-source:**

| Technology | License | Cost |
|---|---|---|
| React.js | MIT | Free |
| Vite | MIT | Free |
| Tailwind CSS | MIT | Free |
| React Router | MIT | Free |
| Node.js | MIT | Free |
| Express.js | MIT | Free |
| PostgreSQL | PostgreSQL License (OSI) | Free |
| Prisma | Apache 2.0 | Free |
| Tesseract.js | Apache 2.0 | Free |
| json-rules-engine | MIT | Free |
| node-cron | ISC | Free |
| Recharts | MIT | Free |
| jsonwebtoken | MIT | Free |
| Vercel (hosting) | Free tier | Free |
| Render.com (hosting) | Free tier | Free |
| Supabase (DB hosting) | Free tier | Free |

**Zero paid APIs. Zero proprietary licenses. Zero trial-gated features.**

---

*This document is complete and self-contained. An AI agent reading only this file should understand every decision that was made and why.*
