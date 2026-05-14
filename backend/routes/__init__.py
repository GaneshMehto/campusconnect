from routes.auth import router as auth
from routes.users import router as users
from routes.jobs import router as jobs
from routes.applications import router as applications
from routes.interviews import router as interviews
from routes.notifications import router as notifications
from routes.analytics import router as analytics
from routes.skills import router as skills

__all__ = ["auth", "users", "jobs", "applications", "interviews", "notifications", "analytics", "skills"]
