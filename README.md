# CrawlIQ — Full-Stack SEO Auditing & Performance Diagnostics Platform

[![Python](https://img.shields.io/badge/Python-3.13-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Playwright](https://img.shields.io/badge/Playwright-Chromium-45BA4B?style=for-the-badge&logo=playwright&logoColor=white)](https://playwright.dev)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

**CrawlIQ** is an enterprise-grade website SEO auditing, technical diagnostics, and performance evaluation platform. It combines a fast static web crawler with a headless Chromium dynamic JavaScript rendering fallback engine, automated diagnostic rules, real-time Google Core Web Vitals analytics, and an interactive dark-theme web dashboard.

---

## 🚀 Key Features

* **🕷️ Intelligent Hybrid Dual-Engine Web Crawler**:
  * **Scrapy Static Spider**: Rapidly crawls static HTML pages, extracts titles, meta descriptions, headings, word counts, and link structures with normalized URL fragment handling.
  * **Playwright Dynamic Rendering Fallback**: Automatically detects Single Page Application (SPA) shells (`is_spa_shell`) and renders client-side JavaScript in a headless Chromium environment to extract fully hydrated DOM elements.
* **🔍 Automated SEO Diagnostic Rules Engine**:
  * Evaluates 14+ rules covering HTTP status errors, missing/short/long title tags, meta description lengths, H1 heading structure, duplicate content across pages, thin content (<200 words), missing image `alt` attributes, canonical tags, `noindex` directives, and broken internal links.
* **📊 Multi-Dimensional Health Scoring Engine**:
  * Computes an aggregate health score (0–100) using weighted penalties (Critical: 15.0, Warning: 5.0, Info: 1.0) normalized by total page count. Generates individual sub-scores for Technical, Content, Meta, and Indexability categories.
* **⚡ Google PageSpeed Insights & Core Web Vitals Integration**:
  * Queries Google PageSpeed Insights API (v5) to capture real-time mobile/desktop Core Web Vitals: Largest Contentful Paint (LCP), First Contentful Paint (FCP), Cumulative Layout Shift (CLS), First Input Delay (FID), Time to First Byte (TTFB), and Speed Index alongside Lighthouse diagnostics.
* **🖥️ Modern Next.js 15 Dark-Theme Dashboard**:
  * Features interactive KPI overview cards, custom SVG semicircle arc gauges (`ArcGauge`), historical crawl velocity dotted bar charts, filterable issue breakdown lists with actionable repair plans (`IssueCard`), and a Core Web Vitals matrix.
* **📄 Executive PDF & Raw CSV Export Engine**:
  * One-click generation of client-ready PDF audit reports (via `jsPDF`) with optional Critical-only severity filtering, plus raw CSV dataset exports for spreadsheet analysis.

---

## 📁 Repository Structure

```
CrawlIQ/
├── frontend/                     # Next.js 15 Frontend Application
│   ├── src/
│   │   ├── app/                  # App Router pages (Dashboard, Audits, PageSpeed, Reports, Sites)
│   │   ├── components/           # UI components (Navbar, ArcGauge, IssueCard, Modals)
│   │   ├── lib/                  # API client & fallback handlers
│   │   └── types/                # TypeScript data interfaces
│   ├── package.json
│   └── tsconfig.json
│
├── seo-tool-backend/             # FastAPI Python Backend Service
│   ├── app/
│   │   ├── api/routes/           # REST endpoints (/sites, /crawls)
│   │   ├── core/                 # Config & Celery initialization
│   │   ├── models/               # SQLAlchemy ORM models (Site, Crawl, Page, Issue, Score)
│   │   ├── schemas/              # Pydantic data schemas
│   │   ├── services/             # Scrapy spider, Playwright crawler, SEO analyzer, PageSpeed service
│   │   ├── database.py           # Database engine & session setup
│   │   └── main.py               # FastAPI entrypoint
│   ├── alembic/                  # Database migration scripts
│   ├── tests/                    # Pytest unit & integration test suite (35 tests)
│   ├── requirements.txt
│   └── alembic.ini
│
├── .gitignore
└── README.md                     # Root Repository Documentation
```

---

## 🛠️ Quickstart & Setup Guide

### Prerequisites
- **Python**: 3.11+ (Python 3.13 recommended)
- **Node.js**: 18+ (Node 20+ recommended)
- **Git**

---

### Step 1: Backend Setup (`seo-tool-backend`)

1. **Navigate to backend directory**:
   ```bash
   cd seo-tool-backend
   ```

2. **Create and activate virtual environment**:
   ```bash
   # Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # macOS / Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies & Playwright Chromium**:
   ```bash
   pip install -r requirements.txt
   playwright install chromium
   ```

4. **Configure environment variables**:
   Create a `.env` file in `seo-tool-backend/`:
   ```env
   ENV=development
   DATABASE_URL=sqlite+aiosqlite:///./seo_tool.db
   PAGESPEED_API_KEY=your_optional_google_api_key_here
   CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000"]
   ```

5. **Run the API server**:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   * Swagger Interactive API documentation will be available at `http://localhost:8000/docs`.

---

### Step 2: Frontend Setup (`frontend`)

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install Node.js packages**:
   ```bash
   npm install
   ```

3. **Start Next.js development server**:
   ```bash
   npm run dev
   ```
   * Open `http://localhost:3000` in your web browser.

---

### Step 3: Running Tests

To run the full backend unit & integration test suite:

```bash
cd seo-tool-backend
$env:PYTHONPATH="."  # Windows PowerShell
.\venv\Scripts\python.exe -m pytest tests/ -v
```

All **35 backend tests** evaluate the API routes, Celery tasks, Playwright crawler fallback, PageSpeed service, and diagnostic rules engine.

---

## 🔌 API Reference Summary

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/health` | `GET` | Server health check probe |
| `/api/v1/sites` | `POST` | Register a new domain for SEO auditing |
| `/api/v1/sites` | `GET` | List all registered sites |
| `/api/v1/sites/{id}` | `GET` | Get single site details |
| `/api/v1/sites/{id}/score` | `GET` | Retrieve latest score from most recent completed crawl |
| `/api/v1/crawls` | `POST` | Trigger a new background crawl task |
| `/api/v1/crawls/{id}` | `GET` | Poll status of an ongoing crawl (`pending`, `running`, `completed`) |
| `/api/v1/crawls/{id}/results` | `GET` | Retrieve complete crawl dataset: audited pages, issues, and score |

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).
