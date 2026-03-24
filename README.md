# Graduate Survey Data Management System

An internal web application for University of Maryland staff to manage, reconcile, and report on graduate student outcomes. Data is aggregated from three external sources — Qualtrics surveys, LinkedIn, and the National Student Clearinghouse — and staff use this tool to review records, select the authoritative source per student, generate reports by major, and export data to CSV or Word documents.

> For step-by-step setup, deployment to AWS, and non-technical operating instructions, see [COMPLETE_GUIDE.md](./COMPLETE_GUIDE.md).

---

## Table of Contents

1. [Architecture](#1-architecture)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Quick Start (Local Development)](#4-quick-start-local-development)
5. [Environment Variables](#5-environment-variables)
6. [Application Pages & Features](#6-application-pages--features)
7. [UI Design System](#7-ui-design-system)
8. [Backend API Reference](#8-backend-api-reference)
9. [Database Schema](#9-database-schema)
10. [Build & Deployment](#10-build--deployment)
11. [Repository](#11-repository)

---

## 1. Architecture

```
User Browser (port 80 in production / 5173 in dev)
         │
         ▼
    Nginx  (production only — serves static files + reverse proxy)
         │
         ├── GET /           →  React app  (dist/index.html)
         ├── GET /assets/*   →  JS / CSS / images
         └── /api/*          →  FastAPI / uvicorn (port 8000)
                                      │
                                      └── PostgreSQL (external AWS RDS)
                                               ├── src.src_qualtrics_response
                                               ├── src.src_linkedin_position
                                               ├── src.src_clearinghouse_record
                                               ├── src.src_demographics
                                               └── analytics.master_graduate_outcomes
```

The frontend makes all API calls to `/api/...`. In development, Vite proxies those to `http://localhost:8000`. In production, Nginx proxies them to the local uvicorn process. The backend is never exposed directly to the internet.

---

## 2. Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend framework | React + TypeScript | 19.x |
| Build tool | Vite | 7.x |
| Component library | Material-UI (MUI) | 7.x |
| Routing | React Router | 7.x |
| Animations | Emotion (CSS-in-JS) | 11.x |
| CSV export | PapaParse | 5.x |
| Backend framework | FastAPI (Python) | 0.100+ |
| ASGI server | uvicorn | 0.20+ |
| Database driver | psycopg (v3) | 3.x |
| Report generation | python-docx | — |
| Web server / proxy | Nginx | 1.24 |
| Process manager | systemd | Ubuntu built-in |
| Database | PostgreSQL | External RDS |
| OS (production) | Ubuntu Server | 22.04 LTS |
| Cloud | AWS EC2 | t3.small |

---

## 3. Project Structure

```
GradSurveyUI/
├── src/
│   ├── api.ts                      # All fetch calls to /api endpoints
│   ├── types.ts                    # TypeScript interfaces (Student, MasterData, etc.)
│   ├── theme.ts                    # MUI theme — UMD Red/Gold palette
│   ├── majorData.ts                # Static list of UMD majors and schools
│   ├── App.tsx                     # React Router configuration
│   ├── main.tsx                    # React entry point
│   ├── components/
│   │   ├── Header.tsx              # Top app bar
│   │   ├── FilterBar.tsx           # Name / UID / Major / School / Term filters
│   │   ├── StudentList.tsx         # Renders the list of StudentCards
│   │   ├── StudentCard.tsx         # Expandable card per student
│   │   ├── DataSourceCard.tsx      # Per-source card (Qualtrics / LinkedIn / ClearingHouse)
│   │   ├── ViewDetailDialog.tsx    # Full-data modal for a data source
│   │   ├── AddManuallyDialog.tsx   # Form to manually enter outcome data
│   │   ├── EditMasterDialog.tsx    # Form to edit an existing master record
│   │   ├── AlertDialog.tsx         # Confirmation dialogs
│   │   ├── EmptyState.tsx          # "No results" UI
│   │   ├── StartFilteringState.tsx # Initial search-prompt UI
│   │   └── UMDLogo.tsx             # Custom SVG shield logo
│   └── pages/
│       ├── LandingPage.tsx         # Home — hero section and navigation
│       ├── DataManagementPage.tsx  # Main dashboard
│       ├── DownloadPage.tsx        # CSV export with multi-filter
│       └── ReportPage.tsx          # Major-level report generation + DOCX download
├── backend/
│   ├── main.py                     # FastAPI app — all route definitions
│   ├── database.py                 # All database queries (~900 lines)
│   ├── report.py                   # Aggregated statistics + DOCX report builder
│   ├── requirements.txt            # Python dependencies
│   └── .env                        # Database credentials (not in git — see Section 5)
├── public/                         # Static assets
├── index.html                      # HTML shell
├── vite.config.ts                  # Vite + proxy config
├── package.json
├── tsconfig.app.json
├── README.md                       # This file
└── COMPLETE_GUIDE.md               # Non-technical setup and AWS deployment guide
```

---

## 4. Quick Start (Local Development)

### Prerequisites

- Node.js 18+ — [nodejs.org](https://nodejs.org)
- Python 3.10+ — [python.org](https://python.org/downloads)
- The `backend/.env` file with database credentials (see Section 5)

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

Backend runs at `http://localhost:8000`. Interactive API docs at `http://localhost:8000/docs`.

### Frontend

```bash
# from the project root
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

Both must be running simultaneously. The frontend's Vite dev server automatically proxies `/api/*` calls to the backend.

### Other commands

```bash
npm run build       # Production build → dist/
npm run preview     # Preview the production build locally
npm run lint        # Run ESLint
tsc -b              # TypeScript type check only
```

---

## 5. Environment Variables

The backend reads credentials from `backend/.env`. This file is excluded from git and must be obtained from the previous maintainer or Sharon.

```env
DB_HOST=<PostgreSQL host>
DB_PORT=5432
DB_NAME=<database name>
DB_USER=<username>
DB_PASSWORD=<password>
```

Never commit this file. If it is accidentally committed, change the database password immediately.

---

## 6. Application Pages & Features

### Landing Page (`/`)

The home page with UMD branding. Features an animated hero section with gradient background, floating UMD logo, and navigation to the two main workflows.

- Animated gradient background (color-shifting keyframes)
- Custom UMD shield logo SVG with floating animation
- Shimmer effects across header and borders
- Pulsing call-to-action button for the dashboard
- Feature cards with 360° icon rotation on hover
- Animated footer with gradient border

### Data Management Dashboard (`/manage`)

The primary working page. Staff search for students, review data from all three sources, and decide which record becomes the authoritative master entry.

**Search-first behavior:** The student list is hidden until at least one filter is applied. This reduces initial load and guides intentional searching.

**Filters:**
- Name (partial text, case-insensitive)
- UID (partial match)
- Major (partial match against `majorData.ts`)
- School
- Term (e.g., Spring 2024)

**Statistics chips** (shown after filtering):
- Total students in system
- Filtered results count
- Students in Master DB count
- "Filters active" indicator (clickable to clear)

**Student Cards:**
- Expandable — click to reveal data source cards
- "In Master DB" badge when a master record exists
- Glowing green border + status dot for master DB entries
- Staggered slide-down animation when expanding (0.6s, 0.7s, 0.8s per card)
- Hover lift effect (4px translateY)

**Data Source Cards** (Qualtrics / LinkedIn / ClearingHouse):
- Color-coded by source: blue (Qualtrics), LinkedIn blue, green (ClearingHouse)
- "View" button — opens a detail dialog with full raw data
- "Select" button — writes this source's data to `analytics.master_graduate_outcomes`
- Glowing shadow effect on selected cards

**Add Manually / Edit:**
- "Add Manually" button on each expanded card opens a form for custom data entry
- For students with existing master records, an edit (pencil) icon opens a pre-filled form
- Fields: Employment Status, Current Employer, Current Position, Enrollment Status, Current Institution

**Empty state:** When filters return no results — floating search icon with pulsing rings and a reset button.

**Start filtering state:** When no filters are active — animated central graphic with rotating dashed circle, pulsing rings, floating accent icons, and quick-tip instructions.

### Download Page (`/download`)

CSV export with combined filtering.

- Three independent dropdowns: Major, School, Term (all default to "All")
- Active filter chips with individual remove buttons
- Clear All button
- Live student count that updates as filters change
- Export Summary card showing filtered count
- Download button disabled when count is zero
- Generated CSV filename encodes all active filter values and the current date
- CSV columns: Name, UID, Major, School, Term, Qualtrics/LinkedIn/ClearingHouse availability, Master DB status, employment data, enrollment data, timestamps

### Report Page (`/report`)

Major-level aggregated statistics and document generation.

- Select a major from the dropdown
- Displays outcome statistics: total graduates, employment rate, top employers, further education rate
- Breakdown by term
- "Download Report" button generates and downloads a `.docx` Word document via the backend
- Report covers all terms available for the selected major

---

## 7. UI Design System

### Colors

| Token | Hex | Usage |
|-------|-----|-------|
| UMD Red | `#E21833` | Primary — headers, borders, buttons |
| UMD Gold | `#FFD200` | Secondary — accents, chips |
| Dark Red | `#C41230` | Hover states, gradients |
| Qualtrics Blue | `#1976D2` | Qualtrics data source cards |
| LinkedIn Blue | `#0A66C2` | LinkedIn data source cards |
| Success Green | `#4CAF50` | Master DB indicators |
| Background | `#F5F5F5` | Page background |

### Animations

All animations use GPU-accelerated transforms and `cubic-bezier(0.4, 0, 0.2, 1)` easing.

| Name | Effect | Applied to |
|------|--------|------------|
| `fadeInUp` | Fade + slide up | Page sections on load |
| `float` | Gentle up/down | UMD logo, empty state icon |
| `pulse` | Scale in/out | CTA button, master DB indicators |
| `shimmer` | Moving light | Hero header, top borders |
| `gradientShift` | Animated color | Hero background |
| `slideInRight` | Slide from right | Stats chips |
| `glow` | Shadow pulse | Master DB card borders |
| `slideDown` | Reveal downward | Expanding student card content |
| `rotate` | 360° continuous | Outer dashed circle (start state) |

Hover effects: cards lift 4px, buttons translate up 2px, icons scale to 1.1, expand chevrons rotate 180°.

### Responsiveness

Material-UI breakpoints. All pages adapt to desktop, tablet, and mobile. Touch-optimized interaction targets.

---

## 8. Backend API Reference

All routes are prefixed `/api/`. The backend validates inputs with Pydantic and returns JSON.

### Students

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/students` | List students with optional filters (`name`, `uid`, `major`, `school`, `term`) and pagination (`limit`, `offset`) |
| `GET` | `/api/students/{uid}` | Get a single student with all source data |
| `POST` | `/api/students/{uid}/master` | Create or update master record for a student |
| `DELETE` | `/api/students/{uid}/master` | Delete a student's master record |

### Filters (dropdown population)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/filters/majors` | Distinct list of majors in the dataset |
| `GET` | `/api/filters/schools` | Distinct list of schools |
| `GET` | `/api/filters/terms` | Distinct list of terms |

### Export & Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/export` | Returns records for CSV export. Accepts same filters as `/api/students` |
| `GET` | `/api/report/data` | Aggregated statistics for a major (`?major=...`) |
| `GET` | `/api/report/download` | Generates and streams a `.docx` report for a major |

---

## 9. Database Schema

The application uses an external PostgreSQL database (AWS RDS). The backend connects read-only to source tables and reads/writes to the analytics table.

### Source tables (read-only)

| Table | Contents |
|-------|----------|
| `src.src_qualtrics_response` | Survey responses. Raw survey data stored in a JSONB `payload` column |
| `src.src_linkedin_position` | LinkedIn positions and education. JSONB payload |
| `src.src_clearinghouse_record` | National Student Clearinghouse enrollment records. JSONB payload |
| `src.src_demographics` | Student demographic data (name, UID, major, school, graduation term) |

### Analytics table (read/write)

| Table | Contents |
|-------|----------|
| `analytics.master_graduate_outcomes` | One row per student. Stores the staff-selected authoritative outcome record plus any manually entered data. Fields: `uid`, `employment_status`, `employer`, `position`, `enrollment_status`, `institution`, `selected_source`, `created_at`, `updated_at` |

---

## 10. Build & Deployment

For detailed instructions — including AWS EC2 setup, Nginx configuration, systemd service, and day-to-day management — see **[COMPLETE_GUIDE.md](./COMPLETE_GUIDE.md)**.

### Production build (frontend)

```bash
npm run build
```

Outputs to `dist/`. Nginx serves these static files directly.

### Production server (backend)

The backend runs as a systemd service (`gradsurvey.service`) managed by uvicorn. It starts automatically on boot and restarts on crash.

```bash
sudo systemctl status gradsurvey   # check status
sudo systemctl restart gradsurvey  # restart after code changes
sudo journalctl -u gradsurvey -f   # live logs
```

### Infrastructure summary

| Component | Details |
|-----------|---------|
| Cloud | AWS EC2 — UMD shared VPC (`prod-sharedvpc1-dept-vpc`) |
| Instance | `t3.small` (2 vCPU, 2 GB RAM), Ubuntu 22.04 LTS |
| IP | Elastic IP (permanent, fixed address) |
| Ports open | 22 (SSH), 80 (HTTP) |
| Storage | 20 GiB gp3 EBS volume |
| Estimated cost | ~$17–25/month running 24/7 |

---

## 11. Repository

**GitHub:** [https://github.com/praveendran-tech/GradSurveyUI](https://github.com/praveendran-tech/GradSurveyUI)

### Cloning

```bash
git clone https://github.com/praveendran-tech/GradSurveyUI.git
cd GradSurveyUI
```

### Branch strategy

All work is on `main`. There are no long-lived feature branches. Deploy directly from `main`.

---

**University of Maryland — Graduate School**
**© 2026. Internal use only.**
