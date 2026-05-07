# Team Task Manager

A full-stack Trello-like task manager built with:

- React + Vite + Tailwind CSS
- Node.js + Express
- SQLite + Prisma
- JWT authentication

## Features

- User signup and login with hashed passwords
- JWT-protected APIs
- Project-based roles with `ADMIN` and `MEMBER`
- Admin member management and task creation
- Member-only assigned task visibility
- Dashboard with totals, status breakdown, and overdue items

## Project Structure

```text
backend/
frontend/
```

## Run Locally

### 1. Backend setup

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

### 2. Frontend setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

### 3. Open the app

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

SQLite is file-based, so there is no separate database download or server setup needed for local development. The backend stores its local database under `%LOCALAPPDATA%/EtharaAI/dev.db` to avoid OneDrive file-lock issues on Windows.

## API Endpoints

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/projects`
- `POST /api/projects`
- `POST /api/projects/:id/members`
- `GET /api/tasks/project/:projectId`
- `POST /api/tasks`
- `PUT /api/tasks/:id`
- `GET /api/dashboard`
