from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config.settings import settings
from middleware.request_id import RequestIdMiddleware

from logging_conf import configure_logging

# Import routers
from routes.auth import router as auth_router
from routes.users import router as users_router
from routes.skills import router as skills_router
from routes.jobs import router as jobs_router
from routes.applications import router as applications_router
from routes.interviews import router as interviews_router
from routes.notifications import router as notifications_router
from routes.analytics import router as analytics_router
from routes.admin import router as admin_router
from routes.companies import router as companies_router
from routes.recruiter import router as recruiter_router


def create_app() -> FastAPI:
    configure_logging()

    app = FastAPI(
        title="CampusConnect – Internship & Placement Management Portal",
        version="1.0.0",
        openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
        docs_url=f"{settings.API_V1_PREFIX}/docs",
        redoc_url=f"{settings.API_V1_PREFIX}/redoc",
    )

    app.add_middleware(RequestIdMiddleware)

    app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

    @app.get("/health")
    def health():
        return {"status": "ok"}

    @app.get("/health/db")
    def health_db():
        """DB connectivity check (does not check schema/migrations)."""
        import logging
        from sqlalchemy import text
        from database.session import engine

        log = logging.getLogger("health.db")
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            return {"status": "ok"}
        except Exception as e:
            log.exception("Database connectivity check failed")
            return {"status": "error", "detail": str(e)}

    # NOTE: Do not create tables on startup in production.
    # Use Alembic migrations instead.

    app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
    app.include_router(users_router, prefix=settings.API_V1_PREFIX)
    app.include_router(skills_router, prefix=settings.API_V1_PREFIX)
    app.include_router(jobs_router, prefix=settings.API_V1_PREFIX)
    app.include_router(applications_router, prefix=settings.API_V1_PREFIX)
    app.include_router(interviews_router, prefix=settings.API_V1_PREFIX)
    app.include_router(notifications_router, prefix=settings.API_V1_PREFIX)
    app.include_router(analytics_router, prefix=settings.API_V1_PREFIX)
    app.include_router(admin_router, prefix=settings.API_V1_PREFIX)
    app.include_router(companies_router, prefix=settings.API_V1_PREFIX)
    app.include_router(recruiter_router, prefix=settings.API_V1_PREFIX)

    return app


app = create_app()
