import asyncio
import re
from typing import Any
from urllib.parse import urljoin, urlparse, urldefrag
from playwright.async_api import async_playwright


async def crawl_page_playwright(
    url: str,
    target_domain: str | None = None,
    timeout_ms: int = 30000,
) -> dict[str, Any]:
    """
    Crawls a single URL using headless Chromium Playwright for full client-side JS rendering.
    Extracts complete SEO payload matching the Scrapy spider schema.
    """
    clean_url, _ = urldefrag(url)
    if not target_domain:
        target_domain = urlparse(clean_url).netloc.split(":")[0].lower()

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="SEO-Analysis-Bot/1.0 (+https://crawliq.com)"
        )
        page = await context.new_page()

        response = None
        was_redirected = False
        final_url = clean_url
        status_code = 200

        try:
            response = await page.goto(clean_url, wait_until="domcontentloaded", timeout=timeout_ms)
            if response:
                status_code = response.status
                final_url, _ = urldefrag(response.url)
                was_redirected = final_url != clean_url

            # Wait briefly for dynamic client-side JS hydration
            await page.wait_for_timeout(1000)
        except Exception as exc:
            await browser.close()
            return {
                "url": clean_url,
                "original_url": url,
                "was_redirected": False,
                "status_code": 500,
                "title": None,
                "title_length": 0,
                "meta_description": None,
                "meta_description_length": 0,
                "h1s": [],
                "h1_count": 0,
                "canonical": None,
                "robots_meta": None,
                "word_count": 0,
                "internal_links": [],
                "external_links": [],
                "images": [],
                "missing_alt_image_count": 0,
                "crawler_used": "playwright",
                "error": str(exc),
            }

        # Extract DOM data using in-browser evaluation for accuracy
        dom_data = await page.evaluate(
            """() => {
                const getTitle = () => {
                    const el = document.querySelector('title');
                    return el ? el.innerText.trim() : null;
                };

                const getMetaDesc = () => {
                    const el = document.querySelector('meta[name="description" i], meta[name="Description" i]');
                    return el ? el.getAttribute('content')?.trim() || null : null;
                };

                const getH1s = () => {
                    const els = Array.from(document.querySelectorAll('h1'));
                    return els.map(e => e.innerText.trim()).filter(t => t.length > 0);
                };

                const getCanonical = () => {
                    const el = document.querySelector('link[rel="canonical"]');
                    return el ? el.getAttribute('href') : null;
                };

                const getRobots = () => {
                    const el = document.querySelector('meta[name="robots" i]');
                    return el ? el.getAttribute('content')?.trim() || null : null;
                };

                const getBodyText = () => {
                    const clone = document.body.cloneNode(true);
                    const removeTags = clone.querySelectorAll('script, style, noscript, svg, iframe');
                    removeTags.forEach(el => el.remove());
                    return clone.innerText || '';
                };

                const getLinks = () => {
                    const anchors = Array.from(document.querySelectorAll('a[href]'));
                    return anchors.map(a => a.getAttribute('href')).filter(Boolean);
                };

                const getImages = () => {
                    const imgs = Array.from(document.querySelectorAll('img'));
                    return imgs.map(img => ({
                        src: img.getAttribute('src') || '',
                        alt: img.getAttribute('alt')
                    }));
                };

                return {
                    title: getTitle(),
                    meta_description: getMetaDesc(),
                    h1s: getH1s(),
                    canonical: getCanonical(),
                    robots_meta: getRobots(),
                    body_text: getBodyText(),
                    links: getLinks(),
                    images: getImages()
                };
            }"""
        )

        await browser.close()

    # Process extracted DOM data
    title = dom_data.get("title")
    meta_description = dom_data.get("meta_description")
    h1s = dom_data.get("h1s", [])

    canonical_raw = dom_data.get("canonical")
    canonical = None
    if canonical_raw:
        canonical_clean, _ = urldefrag(urljoin(final_url, canonical_raw.strip()))
        canonical = canonical_clean

    robots_meta = dom_data.get("robots_meta")

    body_text = dom_data.get("body_text", "")
    words = re.findall(r"\w+", body_text)
    word_count = len(words)

    # Process links
    internal_links = []
    external_links = []
    for href in dom_data.get("links", []):
        href = href.strip()
        if not href or href.startswith(("javascript:", "mailto:", "tel:", "#")):
            continue
        absolute_url, _ = urldefrag(urljoin(final_url, href))
        parsed_href = urlparse(absolute_url)
        if parsed_href.netloc.split(":")[0].lower() == target_domain:
            internal_links.append(absolute_url)
        else:
            external_links.append(absolute_url)

    internal_links = list(dict.fromkeys(internal_links))
    external_links = list(dict.fromkeys(external_links))

    # Process images
    images = []
    for img in dom_data.get("images", []):
        src = img.get("src", "").strip()
        alt = img.get("alt")
        if src:
            src_abs, _ = urldefrag(urljoin(final_url, src))
            alt_clean = alt.strip() if alt is not None else None
            images.append({
                "src": src_abs,
                "alt": alt_clean,
                "has_alt": alt_clean is not None and len(alt_clean) > 0,
            })

    return {
        "url": final_url,
        "original_url": url,
        "was_redirected": was_redirected,
        "status_code": status_code,
        "title": title,
        "title_length": len(title) if title else 0,
        "meta_description": meta_description,
        "meta_description_length": len(meta_description) if meta_description else 0,
        "h1s": h1s,
        "h1_count": len(h1s),
        "canonical": canonical,
        "robots_meta": robots_meta,
        "word_count": word_count,
        "internal_links": internal_links,
        "external_links": external_links,
        "images": images,
        "missing_alt_image_count": sum(1 for img in images if not img["has_alt"]),
        "crawler_used": "playwright",
    }


def crawl_page_playwright_sync(
    url: str,
    target_domain: str | None = None,
    timeout_ms: int = 30000,
) -> dict[str, Any]:
    """Synchronous helper for crawl_page_playwright."""
    return asyncio.run(crawl_page_playwright(url, target_domain, timeout_ms))
