import re
from urllib.parse import urlparse, urljoin, urldefrag
import scrapy
from scrapy.linkextractors import LinkExtractor


class SEOSpider(scrapy.Spider):
    """
    Hardened Scrapy spider for crawling a target domain and extracting core SEO signals.
      - Enforces strict max_pages limit.
      - Normalizes URLs (strips fragments).
      - Ignores non-HTML content types.
      - Captures redirect chains, title, meta description, H1 headers, canonicals, robots, etc.
    """
    name = "seo_spider"

    def __init__(self, start_url: str, max_pages: int = 100, *args, **kwargs):
        super().__init__(*args, **kwargs)
        clean_start_url, _ = urldefrag(start_url)
        self.start_url = clean_start_url
        self.start_urls = [clean_start_url]
        
        parsed = urlparse(clean_start_url)
        self.domain = parsed.netloc.split(":")[0].lower()
        self.allowed_domains = [self.domain]
        self.max_pages = max_pages
        self.pages_crawled = 0
        
        self.link_extractor = LinkExtractor(
            allow_domains=self.allowed_domains,
            deny_extensions=None,  # We handle non-html via content-type in parse
            process_value=lambda url: urldefrag(url)[0]  # Strip fragments from links
        )

    def parse(self, response):
        # 1. Enforce strict max_pages limit
        if self.pages_crawled >= self.max_pages:
            return

        # 2. Skip non-HTML content types (PDF, PNG, ZIP, etc.)
        content_type = response.headers.get("Content-Type", b"").decode("utf-8", errors="ignore").lower()
        if "text/html" not in content_type and "application/xhtml+xml" not in content_type:
            return

        self.pages_crawled += 1

        # Check for redirects
        redirect_urls = response.request.meta.get("redirect_urls", [])
        original_url = redirect_urls[0] if redirect_urls else response.url
        clean_url, _ = urldefrag(response.url)

        # Extract title
        title_raw = response.xpath("//title/text()").get()
        title = title_raw.strip() if title_raw else None

        # Extract meta description
        meta_desc = response.xpath(
            '//meta[translate(@name, "DESCRIPTION", "description")="description"]/@content'
        ).get()
        meta_description = meta_desc.strip() if meta_desc else None

        # Extract H1s
        h1_texts = response.xpath("//h1//text()").getall()
        h1s = [h.strip() for h in h1_texts if h.strip()]

        # Extract Canonical
        canonical_raw = response.xpath('//link[@rel="canonical"]/@href').get()
        canonical = None
        if canonical_raw:
            canonical_clean, _ = urldefrag(urljoin(clean_url, canonical_raw.strip()))
            canonical = canonical_clean

        # Extract Robots meta
        robots_meta = response.xpath(
            '//meta[translate(@name, "ROBOTS", "robots")="robots"]/@content'
        ).get()
        if robots_meta:
            robots_meta = robots_meta.strip()

        # Extract visible text & word count (excluding scripts/styles)
        body_texts = response.xpath(
            '//body//text()[not(parent::script) and not(parent::style) and not(parent::noscript)]'
        ).getall()
        full_text = " ".join(t.strip() for t in body_texts if t.strip())
        words = re.findall(r"\w+", full_text)
        word_count = len(words)

        # Extract links
        internal_links = []
        external_links = []
        for link in response.xpath("//a[@href]/@href").getall():
            href = link.strip()
            if not href or href.startswith(("javascript:", "mailto:", "tel:", "#")):
                continue
            
            absolute_url, _ = urldefrag(urljoin(clean_url, href))
            parsed_href = urlparse(absolute_url)
            
            if parsed_href.netloc.split(":")[0].lower() == self.domain:
                internal_links.append(absolute_url)
            else:
                external_links.append(absolute_url)

        # Deduplicate links preserving order
        internal_links = list(dict.fromkeys(internal_links))
        external_links = list(dict.fromkeys(external_links))

        # Extract images
        images = []
        for img in response.xpath("//img"):
            src = img.xpath("@src").get()
            alt = img.xpath("@alt").get()
            if src:
                src_abs, _ = urldefrag(urljoin(clean_url, src.strip()))
                alt_clean = alt.strip() if alt is not None else None
                images.append({
                    "src": src_abs,
                    "alt": alt_clean,
                    "has_alt": alt_clean is not None and len(alt_clean) > 0
                })

        extracted_data = {
            "url": clean_url,
            "original_url": original_url,
            "was_redirected": len(redirect_urls) > 0,
            "status_code": response.status,
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
        }

        yield extracted_data

        # Follow internal links if within max_pages
        if self.pages_crawled < self.max_pages:
            for link in self.link_extractor.extract_links(response):
                if self.pages_crawled >= self.max_pages:
                    break
                yield response.follow(link, callback=self.parse)
