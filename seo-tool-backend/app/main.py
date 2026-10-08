from contextlib import asynccontextmanager
import datetime
import uuid
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from app.core.config import settings
from app.database import engine, Base, AsyncSessionLocal
from app.models import Site, Crawl, Score, CrawlStatus
from app.api.routes import crawls, sites

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables on startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed initial demo site ONLY in development mode and ONLY if database is empty
    if settings.env == "development":
        async with AsyncSessionLocal() as db:
            res = await db.execute(select(Site))
            if not res.scalars().first():
                now = datetime.datetime.now(datetime.timezone.utc)
                demo_site = Site(
                    id=uuid.UUID("00000000-0000-0000-0000-000000000001"),
                    user_id=uuid.UUID("00000000-0000-0000-0000-000000000000"),
                    domain="techcrunch.com",
                    display_name="TechCrunch Blog",
                    created_at=now,
                    updated_at=now
                )
                db.add(demo_site)
                await db.commit()

                demo_crawl = Crawl(
                    id=uuid.UUID("00000000-0000-0000-0000-000000000002"),
                    site_id=demo_site.id,
                    pages_crawled=142,
                    max_pages=500,
                    status=CrawlStatus.COMPLETED,
                    created_at=now,
                    completed_at=now
                )
                db.add(demo_crawl)
                await db.commit()

                demo_score = Score(
                    id=uuid.UUID("00000000-0000-0000-0000-000000000003"),
                    crawl_id=demo_crawl.id,
                    overall_score=84.0,
                    breakdown={
                        "meta_score": 88,
                        "content_score": 92,
                        "performance_score": 76,
                        "indexability_score": 95,
                        "total_issues": 18,
                        "critical_issues": 3,
                        "warning_issues": 8,
                        "info_issues": 7
                    }
                )
                db.add(demo_score)
                await db.commit()

    yield

app = FastAPI(title="SEO Analysis Tool API", version="0.1.0", lifespan=lifespan)

# Restrict CORS allowed origins to configured frontend URLs (no wildcards with credentials)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.parsed_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sites.router, prefix="/api/v1")
app.include_router(crawls.router, prefix="/api/v1")

@app.get("/health")
async def health():
    return {"status": "ok"}
