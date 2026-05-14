# CampusConnect – Internship & Placement Management Portal

Production-oriented full-stack portal for campus internships and placements.

## Stack
- Backend: FastAPI, SQLAlchemy ORM, PostgreSQL, Alembic, JWT access/refresh auth, RBAC
- Frontend: React + Vite, Tailwind CSS, React Router, Axios interceptors, Context API, Recharts
- Infra: Docker Compose, Render backend config, Vercel frontend config

## Features
- Student, recruiter, and admin authentication with protected role routes
- Student profile, secure resume upload/download, skills, job search, applications, notifications, interviews
- Recruiter company profiles, job CRUD, applicant review, shortlist/reject/offer, interview scheduling, recruiter analytics
- Admin recruiter approval, user/job/application management, notification broadcasts, placement analytics
- Responsive SaaS-style dashboards with loading states, empty states, charts, and toast feedback

## Local Development
1. Copy env files:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```
2. Start PostgreSQL:
   ```bash
   docker compose up -d db
   ```
3. Run migrations:
   ```bash
   cd backend
   alembic upgrade head
   ```
4. Start the backend:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
5. Start the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

API docs are available at `http://localhost:8000/api/v1/docs`.

## Docker
Run the full stack locally:
```bash
docker compose up --build
```

Frontend: `http://localhost:8080`
Backend: `http://localhost:8000`

Run migrations inside the backend container when needed:
```bash
docker compose exec backend alembic upgrade head
```

## Deployment
Backend on Render:
- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port $PORT`
- Required env vars: `DATABASE_URL`, `JWT_SECRET_KEY`, `CORS_ORIGINS`

Frontend on Vercel:
- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Required env var: `VITE_API_BASE_URL=https://your-backend.onrender.com/api/v1`

PostgreSQL:
- Use a managed PostgreSQL instance in production.
- Run `alembic upgrade head` after every deploy that includes migrations.
- Keep `JWT_SECRET_KEY` strong and private.
