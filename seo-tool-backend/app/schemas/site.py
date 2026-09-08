import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class SiteCreate(BaseModel):
    domain: str
    display_name: str | None = None


class SiteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    domain: str
    display_name: str | None
    created_at: datetime
