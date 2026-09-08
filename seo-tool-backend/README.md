# SEO Analysis Tool — Backend (Person 1: Crawling, Scoring, API)

Core engine for the SEO analysis tool: web crawling, technical SEO scoring,
and the FastAPI + PostgreSQL backend that the frontend and AI recommendation
layer build on top of.

## Stack
- FastAPI (async) + SQLAlchemy async ORM + Alembic
- PostgreSQL (JSONB for semi-structured SEO data)
- Celery + Redis for background crawl jobs
- Scrapy (static pages) + Playwright (JS-rendered pages)

## Getting started

```bash
# 1. Start Postgres + Redis
docker compose up -d

# 2. Create venv and install deps
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
playwright install chromium

# 3. Copy env file
cp .env.example .env

# 4. Run first migration
alembic revision --autogenerate -m "init schema"
alembic upgrade head

# 5. Run the API
uvicorn app.main:app --reload
```

API docs available at http://localhost:8000/docs once running.

## Project structure

```
app/
  core/           # config, celery app
  models/         # SQLAlchemy models (Site, Crawl, Page, Issue, Score)
  schemas/        # Pydantic request/response schemas — THE API CONTRACT
  api/routes/      # FastAPI route handlers
  services/       # Celery tasks, crawling logic, scoring logic (build out here)
  database.py     # async engine/session setup
  main.py         # FastAPI app entrypoint
alembic/          # migrations
```

## API contract (Week 1 — stable for frontend/AI integration)

| Endpoint | Purpose |
|---|---|
| `POST /api/v1/sites` | Register a site |
| `GET /api/v1/sites` | List user's sites |
| `GET /api/v1/sites/{id}/score` | Latest score for a site |
| `POST /api/v1/crawls` | Start a crawl (async, returns pending) |
| `GET /api/v1/crawls/{id}` | Poll crawl status |
| `GET /api/v1/crawls/{id}/results` | Full results: pages + issues + score |

Route handlers currently raise `501 Not Implemented` — schemas (`app/schemas/`)
are the real contract and are stable, so the frontend can be built against
these response shapes with mocked data now.

## Build order (see full roadmap)

1. Week 1: this scaffold ✅ — env, schema, migrations, route stubs
2. Week 2: Scrapy crawl → Postgres, one static site, end-to-end
3. Week 3: Playwright routing, scoring logic v1, PageSpeed integration
4. Week 4: Celery orchestration, retries, error handling
5. Week 5: Integration with Person 2's frontend/AI layer
6. Week 6-7: Caching, tests, edge cases
7. Week 8: Deploy (Railway/Render) + architecture writeup
