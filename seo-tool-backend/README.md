# CrawlIQ Backend — FastAPI, Scrapy, Playwright & Celery

Core engine for the **CrawlIQ** SEO analysis platform: web crawling, dynamic JavaScript rendering, technical SEO diagnostic rules, multi-dimensional health scoring, and REST API.

---

## 🛠️ Stack & Technologies

* **Framework**: FastAPI (Python 3.13)
* **Database**: SQLAlchemy Async ORM with SQLite / PostgreSQL
* **Migrations**: Alembic
* **Crawling Engines**: Scrapy (fast static parsing) + Playwright (headless Chromium for SPAs)
* **Background Processing**: Celery + Redis
* **Testing**: Pytest (35 test suite)

---

## 🚀 Running the Backend

```bash
# 1. Activate virtual environment
python -m venv venv
source venv/bin/activate  # Or .\venv\Scripts\Activate.ps1 on Windows

# 2. Install dependencies & browser binaries
pip install -r requirements.txt
playwright install chromium

# 3. Start the FastAPI server
uvicorn app.main:app --reload --port 8000
```

Interactive API Documentation: `http://localhost:8000/docs`

---

## 🧪 Running Tests

```bash
# Set PYTHONPATH and execute pytest suite
python -m pytest tests/ -v
```

All 35 unit & integration tests verify crawler fallback routing, PageSpeed service integration, issue diagnostic rules, scoring formulas, and API routes.
