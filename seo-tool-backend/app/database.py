import os
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

# Database URL with automatic SQLite fallback for frictionless local runs
db_url = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./seo_tool.db")

engine = create_async_engine(
    db_url,
    echo=(settings.env == "development"),
    connect_args={"check_same_thread": False} if "sqlite" in db_url else {}
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

class Base(DeclarativeBase):
    """Base class all ORM models inherit from."""
    pass

async def get_db():
    """FastAPI dependency that yields a DB session per request."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
