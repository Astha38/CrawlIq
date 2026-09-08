from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import crawls, sites

app = FastAPI(title="SEO Analysis Tool API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite/CRA dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sites.router, prefix="/api/v1")
app.include_router(crawls.router, prefix="/api/v1")


@app.get("/health")
async def health():
    return {"status": "ok"}
