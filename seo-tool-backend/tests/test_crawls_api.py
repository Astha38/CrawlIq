import uuid
from unittest.mock import AsyncMock, patch, MagicMock
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.database import get_db
from app.models import Site, Crawl, Page, Issue, Score, CrawlStatus, IssueSeverity


client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_create_site_endpoint():
    mock_db = AsyncMock()
    
    async def mock_get_db():
        yield mock_db

    app.dependency_overrides[get_db] = mock_get_db
    try:
        response = client.post("/api/v1/sites", json={"domain": "example.com", "display_name": "Example"})
        assert response.status_code == 201
        data = response.json()
        assert data["domain"] == "example.com"
        assert data["display_name"] == "Example"
        assert "id" in data
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_create_crawl_site_not_found():
    mock_db = AsyncMock()
    mock_db.get.return_value = None

    async def mock_get_db():
        yield mock_db

    app.dependency_overrides[get_db] = mock_get_db
    try:
        non_existent_site_id = str(uuid.uuid4())
        response = client.post("/api/v1/crawls", json={"site_id": non_existent_site_id, "max_pages": 50})
        assert response.status_code == 404
        assert response.json()["detail"] == "Site not found"
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_create_crawl_success():
    site_id = uuid.uuid4()
    mock_site = Site(id=site_id, user_id=uuid.uuid4(), domain="example.com")
    
    mock_db = AsyncMock()
    mock_db.get.return_value = mock_site

    async def mock_get_db():
        yield mock_db

    app.dependency_overrides[get_db] = mock_get_db
    try:
        with patch("app.api.routes.crawls.crawl_site.delay") as mock_celery_delay:
            response = client.post("/api/v1/crawls", json={"site_id": str(site_id), "max_pages": 50})
            assert response.status_code == 201
            data = response.json()
            assert data["site_id"] == str(site_id)
            assert data["status"] == "pending"
            assert data["max_pages"] == 50
            mock_celery_delay.assert_called_once()
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_get_crawl_results_conflict_when_pending():
    crawl_id = uuid.uuid4()
    mock_crawl = Crawl(
        id=crawl_id,
        site_id=uuid.uuid4(),
        status=CrawlStatus.PENDING,
        pages=[],
        score=None
    )

    mock_db = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = mock_crawl
    mock_db.execute.return_value = mock_result

    async def mock_get_db():
        yield mock_db

    app.dependency_overrides[get_db] = mock_get_db
    try:
        response = client.get(f"/api/v1/crawls/{crawl_id}/results")
        assert response.status_code == 409
        assert "is not completed yet" in response.json()["detail"]
    finally:
        app.dependency_overrides.clear()
