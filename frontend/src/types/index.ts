export type Severity = 'CRITICAL' | 'WARNING' | 'INFO';

export type IssueCategory = 
  | 'META' 
  | 'CONTENT' 
  | 'PERFORMANCE' 
  | 'INDEXABILITY' 
  | 'SECURITY' 
  | 'STRUCTURE';

export type CrawlStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

export interface Site {
  id: string;
  name: string;
  url: string;
  crawl_interval: string; // e.g. 'daily', 'weekly', 'manual'
  created_at: string;
  updated_at: string;
  last_crawl_at?: string;
  latest_score?: number;
  total_crawls?: number;
  pages_count?: number;
  critical_issues_count?: number;
}

export interface Crawl {
  id: string;
  site_id: string;
  site_name?: string;
  site_url?: string;
  status: CrawlStatus;
  started_at: string;
  finished_at?: string;
  pages_crawled: number;
  max_pages: number;
  is_spa: boolean;
  run_pagespeed: boolean;
  error_message?: string;
}

export interface Page {
  id: string;
  crawl_id: string;
  url: string;
  status_code: number;
  depth: number;
  title: string;
  meta_description: string;
  h1: string;
  load_time_ms: number;
  is_indexable: boolean;
  canonical_url?: string;
  score: number;
  issues_count?: number;
}

export interface Issue {
  id: string;
  crawl_id: string;
  page_id?: string;
  rule_id: string;
  severity: Severity;
  category: IssueCategory;
  title: string;
  description: string;
  recommendation: string;
  affected_url: string;
  details?: Record<string, any>;
}

export interface CrawlScore {
  id: string;
  crawl_id: string;
  overall_score: number;
  meta_score: number;
  content_score: number;
  performance_score: number;
  indexability_score: number;
  security_score: number;
  total_issues: number;
  critical_issues: number;
  warning_issues: number;
  info_issues: number;
}

export interface MetricDetail {
  value: number | string;
  unit: string;
  rating: 'GOOD' | 'NEEDS_IMPROVEMENT' | 'POOR';
  score: number;
}

export interface PageSpeedMetrics {
  performance_score: number;
  accessibility_score: number;
  best_practices_score: number;
  seo_score: number;
  metrics: {
    lcp: MetricDetail; // Largest Contentful Paint
    fcp: MetricDetail; // First Contentful Paint
    cls: MetricDetail; // Cumulative Layout Shift
    fid: MetricDetail; // First Input Delay
    ttfb: MetricDetail; // Time to First Byte
    speed_index: MetricDetail;
  };
  diagnostics?: Array<{
    id: string;
    title: string;
    description: string;
    displayValue?: string;
    score: number;
  }>;
}

export interface FilterState {
  severity: Severity | 'ALL';
  category: IssueCategory | 'ALL';
  search: string;
}
