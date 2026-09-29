import pytest
from unittest.mock import AsyncMock, patch, MagicMock

from app.services.pagespeed_service import (
    fetch_pagespeed_metrics,
    fetch_pagespeed_metrics_sync,
)


@pytest.mark.asyncio
async def test_fetch_pagespeed_metrics_success():
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "lighthouseResult": {
            "categories": {
                "performance": {
                    "score": 0.88
                }
            },
            "audits": {
                "largest-contentful-paint": {
                    "displayValue": "1.8 s",
                    "numericValue": 1800.5
                },
                "cumulative-layout-shift": {
                    "displayValue": "0.01",
                    "numericValue": 0.01
                },
                "first-contentful-paint": {
                    "displayValue": "0.9 s",
                    "numericValue": 900.2
                },
                "total-blocking-time": {
                    "displayValue": "120 ms",
                    "numericValue": 120.0
                },
                "speed-index": {
                    "displayValue": "1.4 s",
                    "numericValue": 1400.0
                }
            }
        }
    }

    mock_client = AsyncMock()
    mock_client.__aenter__.return_value = mock_client
    mock_client.get.return_value = mock_response

    with patch("httpx.AsyncClient", return_value=mock_client):
        result = await fetch_pagespeed_metrics("https://example.com", strategy="mobile")
        
        assert result["strategy"] == "mobile"
        assert result["performance_score"] == 88.0
        assert "metrics" in result
        metrics = result["metrics"]
        assert metrics["largest_contentful_paint"]["display_value"] == "1.8 s"
        assert metrics["cumulative_layout_shift"]["numeric_value"] == 0.01
        assert metrics["first_contentful_paint"]["display_value"] == "0.9 s"


@pytest.mark.asyncio
async def test_fetch_pagespeed_metrics_api_error():
    mock_response = MagicMock()
    mock_response.status_code = 429
    mock_response.text = "Quota exceeded"

    mock_client = AsyncMock()
    mock_client.__aenter__.return_value = mock_client
    mock_client.get.return_value = mock_response

    with patch("httpx.AsyncClient", return_value=mock_client):
        result = await fetch_pagespeed_metrics("https://example.com")
        assert result["performance_score"] is None
        assert "error" in result
        assert "429" in result["error"]


def test_fetch_pagespeed_metrics_sync():
    mock_data = {
        "strategy": "mobile",
        "performance_score": 95.0,
        "metrics": {},
        "fetched_at": "2026-09-29T21:00:00Z"
    }

    with patch("app.services.pagespeed_service.fetch_pagespeed_metrics", return_value=mock_data) as mock_async_fn:
        result = fetch_pagespeed_metrics_sync("https://example.com")
        assert result["performance_score"] == 95.0
