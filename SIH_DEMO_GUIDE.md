# 🏆 SIH Live Demo & Presentation Master Guide: MAITRI-Setu

> **AI-Powered Intelligence Layer for Industrial Approvals & Compliance in Maharashtra**  
> *Smart India Hackathon (SIH) Evaluation Round Walkthrough*

---

## 📋 Quick Setup Checklist for Deployed App Video Recording

1. **Verify Deployed App URLs:**
   * **Live App URL:** Ensure your deployed domain (e.g. `https://maitri-setu.vercel.app` or your active production URL) is loaded and fully responsive.
   * Open the app in two separate browser profiles or **Incognito / Dual Windows**:
     * **Window 1 (Left / Applicant View):** Logged in with `applicant@demo.com` / `password123`
     * **Window 2 (Right / Officer View):** Logged in with `officer@demo.com` / `password123`
2. **Browser & Screen Setup:**
   * Set resolution to **1920x1080 (1080p)**.
   * Set Browser Zoom level to **110%** for maximum visual clarity on video.
   * Hide bookmarks bar, notification popups, and clean desktop background.
3. **Recording Software Configuration:**
   * Use **OBS Studio** or **Loom** (Set to 1080p 60fps, crisp 320kbps audio).
   * Ensure voiceover microphone is noise-cancelled.
   * Prepare automated voiceover or crisp script delivery (no filler words like "um", "uh").

---

## 🔐 Pre-Loaded Demo Credentials

| Role | Email | Password | Target Scenario |
|---|---|---|---|
| **Applicant (Entrepreneur)** | `applicant@demo.com` | `password123` | Checklist generation, document OCR, parallel workflows |
| **Department Officer** | `officer@demo.com` | `password123` | SLA tracking, breach alerts, joint inspections, analytics |

---

## 🎬 Screen Recording & Audio Voiceover Sync Script (Duration: ~4-5 Mins)

This script is structured specifically for **Screen Capture (OBS / Loom)** paired with **Voiceover Audio**.

---

### 📍 [0:00 – 0:40] Scene 1: Problem Statement & Landing Page

| Timestamp | Visual Action (What to show/click on screen) | Voiceover Script (What to read aloud) |
|---|---|---|
| **0:00 - 0:15** | Open browser to deployed Landing Page. Smoothly scroll down from top hero banner showing slogan & feature cards. | *"Setting up an industrial unit in India currently takes months because traditional single-window portals act merely as passive digital dropboxes. Applicants suffer from sequential department delays, last-minute document rejections, and missed government subsidies."* |
| **0:15 - 0:40** | Hover over key highlight badges on landing page (Smart Checklist, OCR, SLA Tracker). | *"We present **MAITRI-Setu** — an AI-powered intelligence layer built over Maharashtra's single-window portal. It transforms passive submission into a guided, pre-validated, and parallel approval journey for both entrepreneurs and government officers."* |

---

### 📍 [0:40 – 1:40] Scene 2: Applicant Journey (AI Checklist & OCR Pre-Validation)

| Timestamp | Visual Action (What to show/click on screen) | Voiceover Script (What to read aloud) |
|---|---|---|
| **0:40 - 0:55** | Click **Login**, select **Applicant (`applicant@demo.com`)**, and navigate to **Smart Checklist Generator** (`/checklist`). | *"Let's look at the Applicant experience. Logged in as an entrepreneur, instead of scrolling through generic 100-page PDF policy handbooks, our system dynamically generates a custom compliance checklist."* |
| **0:55 - 1:15** | Select **Sector:** *Manufacturing (Non-Polluting)*, **District:** *Pune*, **Investment:** *₹10 Crores*. Click **Generate Checklist**. Show generated approvals list. | *"By selecting sector, district, and investment capital, our rules engine generates a tailored, location-specific approval list in under 3 seconds."* |
| **1:15 - 1:40** | Click **Document Upload / Pre-Checker**. Upload a sample document. Show the live Tesseract OCR scanner checking stamp and ID details. | *"Before submitting to the government, our embedded **Tesseract OCR engine** pre-validates document contents locally to catch missing stamp numbers or mismatched IDs — avoiding rejections weeks down the line."* |

---

### 1:40 – 2:40 | Scene 3: Parallel Workflow & Subsidies Engine

| Timestamp | Visual Action (What to show/click on screen) | Voiceover Script (What to read aloud) |
|---|---|---|
| **1:40 - 2:10** | Click Application **"XYZ Industries (Nashik)"**. Point mouse cursor to the parallel status timeline nodes (Fire NOC, Pollution, Land running simultaneously). | *"Traditional single-window portals process applications sequentially — Department B waits for Department A. MAITRI-Setu streams clearances into independent parallel tracks, reducing total lead time by up to 50%."* |
| **2:10 - 2:40** | Click **Matched Schemes & Incentives** tab. Highlight state capital subsidy recommendations and power tariff concessions. | *"Our incentive matching engine auto-evaluates enterprise parameters against Maharashtra industrial policies, ensuring small businesses don't miss out on eligible capital subsidies and power concessions."* |

---

### 📍 [2:40 – 3:45] Scene 4: Government Officer Dashboard & SLA Enforcement

| Timestamp | Visual Action (What to show/click on screen) | Voiceover Script (What to read aloud) |
|---|---|---|
| **2:40 - 3:10** | Switch to second browser window logged in as **Department Officer (`officer@demo.com`)**. Show main dashboard. Point cursor to red alert card marked **SLA Overdue / Escalated**. | *"Switching to the Department Officer dashboard: our system auto-prioritizes the approval queue by statutory legal deadlines under the Right to Services Act. Background cron jobs trigger alerts before legal cutoffs expire and auto-escalate delayed files to Appellate Officers."* |
| **3:10 - 3:45** | Click **Analytics & Bottleneck Heatmap**, then click **Joint Inspection Scheduler**. Highlight unified site visit calendar. | *"To eliminate repeated site visits, MAITRI-Setu auto-synchronizes physical inspections across Pollution, Fire, and Health departments into a unified **Joint Inspection Schedule**, cutting official bandwidth and inspector friction."* |

---

### 📍 [3:45 – 4:30] Scene 5: Architecture & Closing Pitch

| Timestamp | Visual Action (What to show/click on screen) | Voiceover Script (What to read aloud) |
|---|---|---|
| **3:45 - 4:15** | Navigate back to system overview / statistics summary page or display tech stack slide. | *"MAITRI-Setu is built using a 100% open-source stack — React, Node.js, Express, Prisma, and Tesseract.js. Designed as an API-first wrapper, it plugs directly into existing state portal REST APIs without replacing legacy databases."* |
| **4:15 - 4:30** | Hover over final call-to-action button or landing page hero screen. End video. | *"MAITRI-Setu turns bureaucratic delays into a fast, transparent, and intelligent growth engine for Maharashtra. Thank you for watching!"* |

---

## 🛡️ Judge Q&A Defense Strategy

| Question | Winning Response |
|---|---|
| **"How will this integrate with the existing MAITRI backend?"** | *"MAITRI-Setu is designed as an API-first wrapper. Our backend service layer standardizes request/response payloads to match state single-window APIs. Replacing the mock data provider with live government endpoints is a drop-in config swap."* |
| **"What if the applicant uploads a fake or blurred OCR document?"** | *"Client-side OCR is the first line of defense to verify document completeness and key registration numbers. In production, this connects to DIGILOCKER and state land record APIs (e.g. Mahabhulekh) for cryptographic verification."* |
| **"How is SLA breach calculated?"** | *"SLA rules are calculated using `node-cron` combined with statutory cutoff rules (e.g. 15 days for Fire NOC). If unanswered at day 12, an alert triggers; at day 15, the system auto-escalates to the Appellate Officer."* |

---

## 🚨 Emergency Backup Plan (Troubleshooting)

* **If Backend stops:** Open a fresh terminal and run `node backend/prisma/seed.js` to reset the database state cleanly.
* **If Offline / No Internet:** The app uses local SQLite (`dev.db`) and local Tesseract OCR, so it runs **100% offline** without internet!

---

*Good luck with your SIH presentation! Bring home the victory!* 🏆
