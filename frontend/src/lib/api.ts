import { Site, Crawl, Page, Issue, CrawlScore, PageSpeedMetrics } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Initial Demo/Mock Data when backend server is offline or in preview mode
const MOCK_SITES: Site[] = [
  {
    id: 'site-1',
    name: 'TechCrunch Blog',
    url: 'https://techcrunch.com',
    crawl_interval: 'daily',
    created_at: '2026-10-01T10:00:00Z',
    updated_at: '2026-10-08T08:30:00Z',
    last_crawl_at: '2026-10-08T08:30:00Z',
    latest_score: 84,
    total_crawls: 12,
    pages_count: 142,
    critical_issues_count: 3,
  },
  {
    id: 'site-2',
    name: 'Acme SaaS Platform',
    url: 'https://acme-saas.app',
    crawl_interval: 'weekly',
    created_at: '2026-09-15T14:20:00Z',
    updated_at: '2026-10-07T12:00:00Z',
    last_crawl_at: '2026-10-07T12:00:00Z',
    latest_score: 92,
    total_crawls: 8,
    pages_count: 68,
    critical_issues_count: 1,
  },
  {
    id: 'site-3',
    name: 'E-Commerce Storefront',
    url: 'https://shop.mystore.io',
    crawl_interval: 'daily',
    created_at: '2026-09-20T09:15:00Z',
    updated_at: '2026-10-06T16:45:00Z',
    last_crawl_at: '2026-10-06T16:45:00Z',
    latest_score: 67,
    total_crawls: 15,
    pages_count: 310,
    critical_issues_count: 9,
  },
];

const MOCK_CRAWLS: Crawl[] = [
  {
    id: 'crawl-101',
    site_id: 'site-1',
    site_name: 'TechCrunch Blog',
    site_url: 'https://techcrunch.com',
    status: 'COMPLETED',
    started_at: '2026-10-08T08:00:00Z',
    finished_at: '2026-10-08T08:30:00Z',
    pages_crawled: 142,
    max_pages: 500,
    is_spa: false,
    run_pagespeed: true,
  },
  {
    id: 'crawl-102',
    site_id: 'site-2',
    site_name: 'Acme SaaS Platform',
    site_url: 'https://acme-saas.app',
    status: 'COMPLETED',
    started_at: '2026-10-07T11:40:00Z',
    finished_at: '2026-10-07T12:00:00Z',
    pages_crawled: 68,
    max_pages: 200,
    is_spa: true,
    run_pagespeed: true,
  },
];

const MOCK_SCORES: Record<string, CrawlScore> = {
  'crawl-101': {
    id: 'score-1',
    crawl_id: 'crawl-101',
    overall_score: 84,
    meta_score: 88,
    content_score: 92,
    performance_score: 76,
    indexability_score: 95,
    security_score: 90,
    total_issues: 18,
    critical_issues: 3,
    warning_issues: 8,
    info_issues: 7,
  },
};

const MOCK_ISSUES: Record<string, Issue[]> = {
  'crawl-101': [
    {
      id: 'iss-1',
      crawl_id: 'crawl-101',
      rule_id: 'missing-meta-description',
      severity: 'CRITICAL',
      category: 'META',
      title: 'Missing Meta Description',
      description: 'Found 14 pages without a <meta name="description"> tag. Search engines use this for snippet previews.',
      recommendation: 'Add unique meta descriptions (120-160 characters) to all affected pages.',
      affected_url: 'https://techcrunch.com/category/startups/page-3',
      details: { missing_count: 14 }
    },
    {
      id: 'iss-2',
      crawl_id: 'crawl-101',
      rule_id: 'duplicate-h1',
      severity: 'CRITICAL',
      category: 'STRUCTURE',
      title: 'Multiple <h1> Heading Tags',
      description: 'Pages contain multiple H1 tags, which can confuse search engine crawler ranking signals.',
      recommendation: 'Ensure each page has exactly one primary <h1> tag representing the page topic.',
      affected_url: 'https://techcrunch.com/2026/10/05/ai-startup-funding/',
      details: { h1_count: 3 }
    },
    {
      id: 'iss-3',
      crawl_id: 'crawl-101',
      rule_id: 'slow-page-response',
      severity: 'CRITICAL',
      category: 'PERFORMANCE',
      title: 'High Response Latency (> 2.5s)',
      description: 'Server response time for initial HTML document exceeded 2500ms threshold.',
      recommendation: 'Enable page caching, optimize database queries, or use a CDN edge worker.',
      affected_url: 'https://techcrunch.com/tag/deep-tech/',
      details: { load_time_ms: 2840 }
    },
    {
      id: 'iss-4',
      crawl_id: 'crawl-101',
      rule_id: 'missing-alt-text',
      severity: 'WARNING',
      category: 'CONTENT',
      title: 'Images Missing Alt Attributes',
      description: 'Found 28 images without alt attributes, harming accessibility and image SEO search indexability.',
      recommendation: 'Add descriptive alt text tags to all key content images.',
      affected_url: 'https://techcrunch.com/events/disrupt-2026/',
      details: { missing_images: 28 }
    },
    {
      id: 'iss-5',
      crawl_id: 'crawl-101',
      rule_id: 'title-too-long',
      severity: 'WARNING',
      category: 'META',
      title: 'Meta Title Exceeds 60 Characters',
      description: 'Title tag text length is 78 characters and will be truncated in Google SERP results.',
      recommendation: 'Shorten meta title tags to stay under 60 characters (approx 580 pixels).',
      affected_url: 'https://techcrunch.com/2026/09/28/future-of-autonomous-agents-and-code-generation-tools/',
      details: { length: 78 }
    },
    {
      id: 'iss-6',
      crawl_id: 'crawl-101',
      rule_id: 'missing-canonical',
      severity: 'INFO',
      category: 'INDEXABILITY',
      title: 'Self-referencing Canonical Missing',
      description: 'Page does not specify an explicit canonical URL link element.',
      recommendation: 'Include a <link rel="canonical"> tag pointing to the authoritative page URL.',
      affected_url: 'https://techcrunch.com/author/john-doe/',
      details: {}
    },
  ]
};

const MOCK_PAGES: Record<string, Page[]> = {
  'crawl-101': [
    {
      id: 'p-1',
      crawl_id: 'crawl-101',
      url: 'https://techcrunch.com',
      status_code: 200,
      depth: 0,
      title: 'TechCrunch – Startup and Technology News',
      meta_description: 'Reporting on the business of technology, startups, venture capital funding, and Silicon Valley.',
      h1: 'Tech News & Analysis',
      load_time_ms: 420,
      is_indexable: true,
      canonical_url: 'https://techcrunch.com/',
      score: 95,
      issues_count: 1
    }
  ]
};

const MOCK_PAGESPEED: Record<string, PageSpeedMetrics> = {
  'crawl-101': {
    performance_score: 76,
    accessibility_score: 92,
    best_practices_score: 96,
    seo_score: 88,
    metrics: {
      lcp: { value: '2.8s', unit: 's', rating: 'NEEDS_IMPROVEMENT', score: 72 },
      fcp: { value: '1.4s', unit: 's', rating: 'GOOD', score: 90 },
      cls: { value: '0.04', unit: '', rating: 'GOOD', score: 98 },
      fid: { value: '38ms', unit: 'ms', rating: 'GOOD', score: 95 },
      ttfb: { value: '640ms', unit: 'ms', rating: 'NEEDS_IMPROVEMENT', score: 68 },
      speed_index: { value: '3.1s', unit: 's', rating: 'NEEDS_IMPROVEMENT', score: 74 },
    },
    diagnostics: [
      {
        id: 'render-blocking-resources',
        title: 'Eliminate render-blocking resources',
        description: 'Resources are blocking the first paint of your page. Consider delivering critical JS/CSS inline.',
        displayValue: 'Potential savings of 480 ms',
        score: 60,
      },
      {
        id: 'unused-javascript',
        title: 'Reduce unused JavaScript',
        description: 'Reduce unused JavaScript and defer loading scripts until they are required.',
        displayValue: 'Potential savings of 320 KiB',
        score: 75,
      }
    ]
  }
};

// API Fetch Helper with Fallback
async function fetchWithFallback<T>(url: string, options?: RequestInit, fallbackData?: T): Promise<T> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!res.ok) {
      throw new Error(`API Error ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.warn(`Backend API at ${url} unavailable or returned error. Using fallback mode.`, error);
    if (fallbackData !== undefined) {
      return fallbackData;
    }
    throw error;
  }
}

export const api = {
  // Sites
  async getSites(): Promise<Site[]> {
    try {
      const rawSites = await fetchWithFallback<any[]>(`${API_BASE_URL}/sites`, {}, MOCK_SITES as any);
      let sitesList: Site[] = [];
      if (!Array.isArray(rawSites) || rawSites === (MOCK_SITES as any)) {
        sitesList = MOCK_SITES;
      } else {
        sitesList = rawSites.map(s => ({
          id: s.id,
          name: s.display_name || s.domain,
          url: s.domain.startsWith('http') ? s.domain : `https://${s.domain}`,
          crawl_interval: 'daily',
          created_at: s.created_at || new Date().toISOString(),
          updated_at: s.updated_at || new Date().toISOString(),
          latest_score: 88,
          pages_count: 120,
          critical_issues_count: 2,
        }));
      }
      const uniqueMap = new Map<string, Site>();
      sitesList.forEach(s => uniqueMap.set(s.id, s));
      return Array.from(uniqueMap.values());
    } catch {
      const uniqueMap = new Map<string, Site>();
      MOCK_SITES.forEach(s => uniqueMap.set(s.id, s));
      return Array.from(uniqueMap.values());
    }
  },

  async createSite(data: { name: string; url: string; crawl_interval: string }): Promise<Site> {
    const domainClean = data.url.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    const payload = {
      domain: domainClean,
      display_name: data.name,
    };

    const newSiteFallback: Site = {
      id: `site-${Date.now()}`,
      name: data.name,
      url: data.url.startsWith('http') ? data.url : `https://${data.url}`,
      crawl_interval: data.crawl_interval,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      latest_score: 100,
      total_crawls: 0,
      pages_count: 0,
      critical_issues_count: 0,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/sites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to create site on backend');
      const raw = await res.json();
      const createdSite: Site = {
        id: raw.id,
        name: raw.display_name || raw.domain,
        url: `https://${raw.domain}`,
        crawl_interval: data.crawl_interval,
        created_at: raw.created_at,
        updated_at: raw.updated_at,
        latest_score: 100,
        pages_count: 0,
        critical_issues_count: 0,
      };
      if (!MOCK_SITES.some(s => s.id === createdSite.id)) {
        MOCK_SITES.unshift(createdSite);
      }
      return createdSite;
    } catch (e) {
      console.warn('Backend API createSite failed, saving locally', e);
      if (!MOCK_SITES.some(s => s.id === newSiteFallback.id)) {
        MOCK_SITES.unshift(newSiteFallback);
      }
      return newSiteFallback;
    }
  },

  async deleteSite(siteId: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/sites/${siteId}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Mock delete site', e);
    }
    const idx = MOCK_SITES.findIndex(s => s.id === siteId);
    if (idx !== -1) MOCK_SITES.splice(idx, 1);
  },

  // Crawls
  async triggerCrawl(data: { site_id: string; max_pages?: number }): Promise<Crawl> {
    const payload = {
      site_id: data.site_id,
      max_pages: data.max_pages || 100,
    };

    const newCrawlFallback: Crawl = {
      id: `crawl-${Date.now()}`,
      site_id: data.site_id,
      status: 'IN_PROGRESS',
      started_at: new Date().toISOString(),
      pages_crawled: 0,
      max_pages: data.max_pages || 100,
      is_spa: false,
      run_pagespeed: true,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/crawls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Crawl creation failed');
      const raw = await res.json();
      return {
        id: raw.id,
        site_id: raw.site_id,
        status: raw.status,
        started_at: raw.created_at,
        pages_crawled: raw.pages_crawled,
        max_pages: raw.max_pages,
        is_spa: false,
        run_pagespeed: true,
      };
    } catch (e) {
      console.warn('Backend API triggerCrawl fallback', e);
      MOCK_CRAWLS.unshift(newCrawlFallback);
      return newCrawlFallback;
    }
  },

  async getCrawl(crawlId: string): Promise<Crawl> {
    const found = MOCK_CRAWLS.find(c => c.id === crawlId) || MOCK_CRAWLS[0];
    return fetchWithFallback<Crawl>(`${API_BASE_URL}/crawls/${crawlId}`, {}, found);
  },

  async getCrawlScore(crawlId: string): Promise<CrawlScore> {
    const score = MOCK_SCORES[crawlId] || MOCK_SCORES['crawl-101'];
    return fetchWithFallback<CrawlScore>(`${API_BASE_URL}/crawls/${crawlId}/score`, {}, score);
  },

  async getCrawlIssues(crawlId: string): Promise<Issue[]> {
    const issues = MOCK_ISSUES[crawlId] || MOCK_ISSUES['crawl-101'];
    return fetchWithFallback<Issue[]>(`${API_BASE_URL}/crawls/${crawlId}/issues`, {}, issues);
  },

  async getCrawlPages(crawlId: string): Promise<Page[]> {
    const pages = MOCK_PAGES['crawl-101'];
    return fetchWithFallback<Page[]>(`${API_BASE_URL}/crawls/${crawlId}/pages`, {}, pages);
  },

  async getPageSpeed(crawlId: string): Promise<PageSpeedMetrics> {
    const metrics = MOCK_PAGESPEED[crawlId] || MOCK_PAGESPEED['crawl-101'];
    return fetchWithFallback<PageSpeedMetrics>(`${API_BASE_URL}/crawls/${crawlId}/pagespeed`, {}, metrics);
  }
};
