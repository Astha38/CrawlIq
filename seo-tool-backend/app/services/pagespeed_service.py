import asyncio
import logging
from datetime import datetime, timezone
from typing import Any
import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

PAGESPEED_API_URL = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed"


async def fetch_pagespeed_metrics(
    url: str,
    strategy: str = "mobile",
    timeout_sec: float = 30.0,
) -> dict[str, Any]:
    """
    Queries Google PageSpeed Insights API (v5) to retrieve Lighthouse performance
    score and Core Web Vitals (LCP, CLS, FCP, TBT, Speed Index).
    """
    params: dict[str, str] = {
        "url": url,
        "strategy": strategy,
        "category": "performance",
    }

    if settings.pagespeed_api_key:
        params["key"] = settings.pagespeed_api_key

    try:
        async with httpx.AsyncClient(timeout=timeout_sec) as client:
            response = await client.get(PAGESPEED_API_URL, params=params)
            
            if response.status_code != 200:
                logger.warning(
                    f"PageSpeed API returned status {response.status_code} for {url}: {response.text[:200]}"
                )
                return {
                    "strategy": strategy,
                    "performance_score": None,
                    "error": f"PageSpeed API error (status {response.status_code})",
                    "fetched_at": datetime.now(timezone.utc).isoformat(),
                }

            data = response.json()
            lighthouse = data.get("lighthouseResult", {})
            categories = lighthouse.get("categories", {})
            perf_cat = categories.get("performance", {})
            
            raw_score = perf_cat.get("score")
            performance_score = round(raw_score * 100, 1) if raw_score is not None else None

            audits = lighthouse.get("audits", {})

            def extract_audit(audit_key: str) -> dict[str, Any]:
                audit = audits.get(audit_key, {})
                return {
                    "display_value": audit.get("displayValue"),
                    "numeric_value": audit.get("numericValue"),
                }

            return {
                "strategy": strategy,
                "performance_score": performance_score,
                "metrics": {
                    "largest_contentful_paint": extract_audit("largest-contentful-paint"),
                    "cumulative_layout_shift": extract_audit("cumulative-layout-shift"),
                    "first_contentful_paint": extract_audit("first-contentful-paint"),
                    "total_blocking_time": extract_audit("total-blocking-time"),
                    "speed_index": extract_audit("speed-index"),
                },
                "fetched_at": datetime.now(timezone.utc).isoformat(),
            }

    except Exception as exc:
        logger.error(f"Failed to fetch PageSpeed metrics for {url}: {exc}")
        return {
            "strategy": strategy,
            "performance_score": None,
            "error": str(exc),
            "fetched_at": datetime.now(timezone.utc).isoformat(),
        }


def fetch_pagespeed_metrics_sync(
    url: str,
    strategy: str = "mobile",
    timeout_sec: float = 30.0,
) -> dict[str, Any]:
    """Synchronous helper for fetch_pagespeed_metrics."""
    return asyncio.run(fetch_pagespeed_metrics(url, strategy, timeout_sec))
