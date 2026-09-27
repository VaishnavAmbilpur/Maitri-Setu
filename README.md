# MAITRI-Setu

> **AI-Powered Intelligence Layer for Industrial Approvals & Compliance in Maharashtra**

MAITRI-Setu sits on top of Maharashtra's existing MAITRI single-window system, turning "apply and wait" into a **guided, predictive, and coordinated journey** — for both applicants and government officers.

---

## Features

| Feature | Description |
|---|---|
| **Smart Checklist Generator** | Personalized approval list based on sector, location, and investment |
| **Document Pre-Validation** | Instant OCR-based checking before submission |
| **Parallel Workflow Orchestrator** | Independent approvals run simultaneously |
| **SLA Tracker & Escalation** | Real-time deadline monitoring with legal threshold alerts |
| **Incentive Matching Engine** | Auto-suggested government schemes |
| **Analytics Dashboard** | Department-wise delay and bottleneck visibility |
| **Joint Inspection Scheduling** | Coordinated multi-department site visits |

---

## Tech Stack (100% Free & Open Source)

| Layer | Technology |
|---|---|
| Frontend | React.js + Vite + Tailwind CSS |
| Routing | React Router v6 |
| Charts | Recharts |
| Backend | Node.js + Express.js |
| Database | SQLite / PostgreSQL + Prisma ORM |
| OCR | Tesseract.js |
| Rules Engine | json-rules-engine |
| Auth | JWT (jsonwebtoken) |
| SLA Scheduler | node-cron |

---

## Quick Start

### Prerequisites
- Node.js 18+
- Git

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd maitri-setu

# Install frontend
cd frontend && npm install

# Install backend
cd ../backend && npm install
```

### 2. Configure Database & Environment

```bash
# Edit backend/.env
DATABASE_URL="file:./dev.db"
JWT_SECRET=super_secret_jwt_key_sih2026
PORT=5000
```

### 3. Run Migrations & Seed

```bash
cd backend
npx prisma db push
node prisma/seed.js
```

### 4. Start Development Servers

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

Visit **http://localhost:3000**

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Applicant | `applicant@demo.com` | `password123` |
| Applicant | `anita@demo.com` | `password123` |
| Officer | `officer@demo.com` | `password123` |

---

## Pre-seeded Demo Data

| Application | Sector | Status | SLA |
|---|---|---|---|
| ABC Manufacturing (Pune) | Mfg - Non-Polluting | Approved | All clear |
| XYZ Industries (Nashik) | Mfg - Polluting | In Progress | Fire NOC near deadline |
| TechStart IT (Mumbai) | IT/Services | SLA Breached | Factory Licence overdue |
| Nagpur Foods (Nagpur) | Food Processing | Draft | Not submitted |

---

## Project Structure

```
├── frontend/           React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── api/        Axios API client
│   │   ├── context/    Auth context
│   │   ├── components/ Shared components & Shadcn UI
│   │   └── pages/      Applicant & Officer page views
│   └── package.json
├── backend/            Node + Express + Prisma ORM
│   ├── prisma/         Schema + seed script + SQLite DB
│   ├── src/
│   │   ├── routes/     API endpoints
│   │   ├── services/   SLA tracker & Keep-Alive cron
│   │   ├── middleware/ JWT auth
│   │   ├── mockData/   Rules + incentives JSON
│   │   └── server.js   Express entry point
│   └── package.json
└── .AGENTS/            SIH 2026 Architecture & Specs
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login, returns JWT |
| POST | `/api/auth/register` | Register new user |
| POST | `/api/checklist` | Generate personalized checklist |
| GET | `/api/checklist/sectors` | List available sectors |
| POST | `/api/applications` | Create application |
| GET | `/api/applications` | List user's applications |
| GET | `/api/applications/:id` | Get application detail |
| POST | `/api/applications/:id/submit` | Submit application |
| POST | `/api/documents/:approvalId/upload` | Upload document |
| GET | `/api/incentives/match/:appId` | Match incentives |
| GET | `/api/officer/queue` | Officer queue |
| GET | `/api/officer/analytics` | Officer analytics |
| PATCH | `/api/officer/approve/:id` | Approve/reject |

---

## About MAITRI Integration

This prototype uses **mocked department data** since real MAITRI API access requires official government partnership. The mock layer uses the exact same request/response shapes as real integration would, making the swap a drop-in replacement.

---

## License

MIT — All technologies used are free and open-source.

---

*Built for SIH 2026 — Bridging Entrepreneurs and Government, Intelligently.*
