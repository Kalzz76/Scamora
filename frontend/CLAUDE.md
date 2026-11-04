# CLAUDE.md - Context & Instructions for Scamora AI Frontend

## 📌 Project Overview
**Scamora AI** is a digital threat intelligence and cyber-hygiene platform designed for the **MIT-Week 2026 Innovation Challenge**. It empowers users to detect early indications of phishing links and WhatsApp social engineering scams using rule-based heuristics and AI reasoning.

---

## 💻 Tech Stack
- **Framework:** React 19 + TypeScript 5 (Strict Mode)
- **Bundler:** Vite 6+
- **Styling:** Tailwind CSS v4 (configured via `@tailwindcss/vite` and `@theme` directives in `src/index.css`)
- **Icons:** `lucide-react` + Material Symbols Outlined
- **Routing:** `react-router-dom` (`HashRouter` for universal compatibility across static hosts/subpaths)
- **HTTP Client:** `axios` (with normalized error handling and mock switcher in `src/services/apiClient.ts`)
- **State Management:** In-memory React State + Local Storage bypass for zero-retention privacy compliance

---

## ⚡ Essential Commands
All frontend commands must be run inside the `frontend/` directory:

```bash
cd frontend

# Start local development server (with HMR)
npm run dev

# Run TypeScript check & production build
npm run build

# Preview production build locally
npm run preview
```

---

## 📂 Project Structure (`frontend/src/`)

```
frontend/src/
├── components/
│   ├── common/
│   │   ├── PrivacyModal.tsx   # Modal transparansi privasi, PII masking notice, & consent gate
│   │   ├── SimPanel.tsx       # Floating control widget to simulate failures (429, 503, partial Safe Browsing)
│   │   └── Stepper.tsx        # 4-stage diagnostic telemetry loading animation
│   └── layout/
│       ├── Navbar.tsx         # Sticky navigation with engine status badge & mobile menu
│       └── Footer.tsx         # Universal footer with ethical disclaimer & MIT-Week branding
├── features/
│   ├── home/
│   │   └── HomePage.tsx       # Cyber Console Hero, P0 direct CTAs, preset demo attack showcase
│   ├── url-checker/
│   │   └── UrlCheckerPage.tsx # P0: URL input, protocol badge (HTTPS/HTTP), 2048-char counter, demo pills
│   ├── chat-detector/
│   │   └── ChatDetectorPage.tsx # P0: WhatsApp chat textarea (10-5000 char), live PII masking preview
│   ├── risk-report/
│   │   └── ReportPage.tsx     # P0: Risk score gauge (0-100), 3 official categories, verified quotes, actions
│   ├── panduan/
│   │   └── PanduanPage.tsx    # P0/P1: Incident response guides & 6-point interactive security checklist
│   ├── challenge/
│   │   └── QuizPage.tsx       # P1: Guardian Challenge 6 interactive quiz cases with instant explanations
│   └── knowledge/
│       └── KnowledgePage.tsx  # P1: Scam encyclopedia (APK, Task scam, Bank phishing, Vishing OTP)
├── lib/
│   ├── constants.ts           # Risk categories, demo presets, scoring thresholds, metadata
│   └── utils.ts               # cn() helper (clsx + twMerge), escapeHtml(), formatDateTime()
├── services/
│   ├── apiClient.ts           # Axios client configured with VITE_API_BASE_URL
│   ├── analysisService.ts     # Smart switcher between Mock Engine & real Laravel API (VITE_USE_MOCK)
│   └── mockAnalyzer.ts        # Fully-typed client-side heuristic engine & PII scrubbing
├── types/
│   ├── analysis.ts            # Type definitions: RiskLevel, Indicator, PipelineCheck, AnalysisResult
│   └── api.ts                 # API contracts: AnalyzeUrlPayload, AnalyzeChatPayload, ApiResponse
├── App.tsx                    # Route definitions, global modals, and session state
├── index.css                  # Tailwind v4 @theme tokens, typography, and custom scrollbars
└── main.tsx                   # React root entry point
```

---

## 🎨 Design System & Theme Tokens (Tailwind CSS v4)
Design aesthetic: **Material 3 Cyber Console / Diagnostic Telemetry Dashboard**.

Configured in `src/index.css` via `@theme`:
- **Surface (Backgrounds):**
  - `--color-surface`: `#f8f9ff` (Canvas background)
  - `--color-surface-container-lowest`: `#ffffff` (Card background)
  - `--color-surface-container-low`: `#eff4ff` (Secondary container)
  - `--color-surface-container`: `#e5eeff` (Divider & active pill)
  - `--color-surface-container-high`: `#dce9ff`
- **Brand & Accent (Cyber Blue):**
  - `--color-secondary`: `#0051d5` (Primary action blue)
  - `--color-secondary-container`: `#316bf3` (Hover state)
  - `--color-secondary-fixed`: `#dbe1ff` (Soft chip background)
- **Risk Level Colors:**
  - **High Risk:** `--color-error`: `#ba1a1a`, `--color-error-container`: `#ffdad6`
  - **Review Needed:** Amber palette (`bg-amber-500/10`, `text-amber-800`, `border-amber-500/40`)
  - **Low Risk:** `--color-on-tertiary-container`: `#009485` (Teal/Emerald soft green)
- **Typography:**
  - UI Text: `Inter` (`var(--font-sans)`)
  - Telemetry, Code, URLs: `JetBrains Mono` (`var(--font-mono)`)

---

## ⚖️ Strict Business Rules & Ethics (Non-Negotiable)
When modifying the UI or features, **you must preserve these rules**:
1. **Results are "Indikasi Risiko", NOT a Verdict:**
   - Never use words like *"100% Aman"* or *"Pasti Penipuan"*.
   - The 3 official categories are strictly:
     - `high`: **Indikasi risiko tinggi**
     - `review`: **Perlu ditinjau lebih lanjut**
     - `low`: **Indikator risiko rendah**
2. **Authentic Evidence is Mandatory:**
   - Every indicator card displayed in `ReportPage.tsx` must cite the authentic quote from user input (`ind.evidence`).
3. **Honest Failure Reporting:**
   - If external services fail (e.g. Safe Browsing or Claude AI timeout), the status must be `partial`. Category `low` is **forbidden** during partial/failed states (it must default to `review`).
4. **Zero-Retention Privacy:**
   - Raw chat text and URLs must never be saved in persistent local storage or transmitted unmasked.
   - PII (Indonesian phone numbers, NIK, bank accounts, OTPs) must be scrubbed before AI processing.

---

## 🔌 Backend Integration Contract
The frontend is ready to connect to a Laravel 13 backend.
Set in `frontend/.env`:
```env
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://localhost:8000/api/v1
```
Endpoints expected:
- `POST /api/v1/analyze/url` payload: `{ "url": string, "privacy_consent": boolean }`
- `POST /api/v1/analyze/chat` payload: `{ "text": string, "privacy_consent": boolean }`
- Expected JSON response schema is defined in `src/types/analysis.ts` (`AnalysisResult`).

---

## 🎯 Guidance for UI Customization
When Claude is tasked with modifying or restyling the frontend:
- Keep all existing props and TypeScript interfaces intact in `src/types/analysis.ts`.
- Tailwind CSS v4 is used: use standard utility classes or customize `@theme` in `src/index.css`.
- Ensure all interactive elements have visible focus outlines for WCAG AA compliance.
- Maintain responsive layouts across mobile (`sm`), tablet (`md`), and desktop (`lg/xl`).

