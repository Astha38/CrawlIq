import enum


class CrawlStatus(str, enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class CrawlerType(str, enum.Enum):
    SCRAPY = "scrapy"
    PLAYWRIGHT = "playwright"


class IssueSeverity(str, enum.Enum):
    CRITICAL = "critical"
    WARNING = "warning"
    INFO = "info"
