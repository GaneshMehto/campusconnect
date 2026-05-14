# CampusConnect Backend

FastAPI API with SQLAlchemy, PostgreSQL, Alembic migrations, JWT access/refresh auth, RBAC, uploads, notifications, interviews, and analytics.

## Setup
```bash
cp .env.example .env
pip install -r requirements.txt
alembic upgrade head
uvicorn main:app --reload --port 8000
```

Docs: `http://localhost:8000/api/v1/docs`

## Required Environment
- `DATABASE_URL`
- `JWT_SECRET_KEY`
- `JWT_ACCESS_TOKEN_EXPIRE_MINUTES`
- `JWT_REFRESH_TOKEN_EXPIRE_DAYS`
- `CORS_ORIGINS`
- `UPLOAD_DIR`

## Production Notes
- Always run `alembic upgrade head` before serving new code.
- Use a strong `JWT_SECRET_KEY`.
- Store uploads on persistent disk or external object storage in production.
- Set `CORS_ORIGINS` to your deployed frontend origin.
