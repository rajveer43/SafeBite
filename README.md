# 🍽️ SafeBite

> **Hyperlocal Food Safety & Kitchen Transparency Platform** — connecting customers, restaurant owners, and food safety inspectors around trustworthy, location-aware safety data.

SafeBite is a monorepo with two applications:

| App | Path | Stack |
| --- | --- | --- |
| **Backend API** | [`backend-SB/`](backend-SB/) | Python · FastAPI · PostgreSQL + PostGIS · SQLAlchemy · Alembic · JWT |
| **Frontend Web** | [`frontend-SB/`](frontend-SB/) | React 19 · TypeScript · Vite · Tailwind CSS v4 |

---

## 📖 Overview

SafeBite improves trust between customers, restaurants, and food-safety authorities. Restaurant owners register and maintain safety information; inspectors record inspections and manage certificates; customers browse reliable, geolocated food-safety details before they order; and admins oversee the whole platform.

The backend exposes a REST API secured with JWT and role-based access control. Because restaurants are geolocated, the database uses **PostgreSQL with the PostGIS extension** (via GeoAlchemy2) for geospatial queries.

---

## ✨ Features

- 🔐 **JWT authentication** with password hashing (BCrypt)
- 👥 **Role-based access control** — `customer`, `owner`, `inspector`, `admin`
- 🏪 **Restaurant management** — registration, status, assigned inspectors
- 🧾 **Inspections, complaints, and certificates** workflows
- 📊 **Safety scores** and admin dashboards
- 🔔 **Notifications**
- 🗺️ **Geospatial data** with PostgreSQL + PostGIS (GeoAlchemy2 / Shapely)
- 🗃️ **Alembic migrations** for versioned schema changes
- ⚛️ **Modern React 19 SPA** with Vite, Tailwind CSS v4, and Google Maps integration

---

## 🧱 Tech Stack

| Layer | Technologies |
| --- | --- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, React Router, React Hook Form + Zod, Axios, Recharts, Framer Motion, `@react-google-maps/api` |
| **Backend** | FastAPI, Uvicorn, Pydantic / pydantic-settings |
| **Database** | PostgreSQL + PostGIS |
| **ORM / Migrations** | SQLAlchemy, GeoAlchemy2, Alembic |
| **Auth** | JWT (`python-jose`), Passlib (BCrypt) |
| **Tooling** | Oxlint (frontend), npm, Python venv |

---

## 🗂️ Monorepo Structure

```text
SafeBite/
├── backend-SB/               # FastAPI backend
│   ├── alembic/              # Migration environment
│   │   └── versions/         # Migration scripts
│   ├── app/
│   │   ├── api/              # Route handlers (auth, restaurant, inspection, ...)
│   │   ├── core/             # config.py, security.py, constants.py
│   │   ├── database/         # engine, session, Base
│   │   ├── models/           # SQLAlchemy models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # Business logic
│   │   ├── repositories/     # Data access
│   │   └── main.py           # FastAPI app entrypoint
│   ├── scripts/              # seed_admin.py, clear_test_data.py
│   ├── alembic.ini
│   └── requirements.txt
│
└── frontend-SB/              # React + Vite frontend
    ├── src/
    │   ├── api/ services/    # API clients
    │   ├── components/       # UI components
    │   ├── pages/            # Route pages (landing, dashboards, ...)
    │   ├── contexts/ hooks/  # State & logic
    │   └── main.tsx          # App entrypoint
    ├── index.html
    ├── vite.config.ts
    └── package.json
```

---

## ✅ Prerequisites

Install these before you start. Version numbers are minimums that are known to work.

| Tool | Version | Notes |
| --- | --- | --- |
| **Git** | any recent | To clone the repo |
| **Python** | 3.11+ | Backend runtime |
| **Node.js** | 18+ (LTS) | Frontend runtime; ships with `npm` |
| **PostgreSQL** | 14+ | Database |
| **PostGIS** | matching your PostgreSQL | Geospatial extension (required) |

> 💡 **PostGIS install tips**
> - **macOS (Homebrew):** `brew install postgresql postgis`
> - **Ubuntu/Debian:** `sudo apt install postgresql postgis postgresql-<version>-postgis-3`
> - **Windows:** Use the [EnterpriseDB PostgreSQL installer](https://www.postgresql.org/download/windows/) and enable **PostGIS** in the bundled **Stack Builder**.

---

## 🚀 Quick Start

The short path. Each step is expanded in the sections below.

```bash
# 1. Clone
git clone <your-repo-url> SafeBite
cd SafeBite

# 2. Backend (in one terminal)
cd backend-SB
python -m venv venv
source venv/bin/activate            # Windows: venv\Scripts\activate
pip install -r requirements.txt
# create your .env (see Backend Setup), then:
alembic upgrade head
python scripts/seed_admin.py
uvicorn app.main:app --reload       # → http://127.0.0.1:8000

# 3. Frontend (in a second terminal, from the repo root)
cd frontend-SB
npm install
# create your .env (see Frontend Setup), then:
npm run dev                         # → http://localhost:5173
```

---

## ⚙️ Backend Setup (`backend-SB`)

All commands below assume you are in the `backend-SB` directory:

```bash
cd backend-SB
```

### 1. Create and activate a virtual environment, then install dependencies

```bash
python -m venv venv
```

Activate it:

```bash
# macOS / Linux
source venv/bin/activate

# Windows (PowerShell)
venv\Scripts\Activate.ps1

# Windows (cmd)
venv\Scripts\activate.bat
```

Install the Python dependencies:

```bash
pip install -r requirements.txt
```

### 2. Create the PostgreSQL database and enable PostGIS

Make sure your PostgreSQL server is running, then create a database and enable the PostGIS extension inside it:

```bash
# Create the database (adjust the user if you don't use "postgres")
createdb safebite

# Enable PostGIS inside the new database
psql -d safebite -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```

> 🧭 Prefer SQL? From a `psql` session:
> ```sql
> CREATE DATABASE safebite;
> \c safebite
> CREATE EXTENSION IF NOT EXISTS postgis;
> ```

### 3. Create your `.env` file

Create a file named `.env` in `backend-SB/` (it is git-ignored — **never commit real secrets**):

```bash
# backend-SB/.env
DATABASE_URL=postgresql://postgres:PASSWORD@localhost:5432/safebite
SECRET_KEY=change-me-to-a-long-random-string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

Environment variables read by [`app/core/config.py`](backend-SB/app/core/config.py):

| Variable | Required | Example | Description |
| --- | --- | --- | --- |
| `DATABASE_URL` | ✅ Yes | `postgresql://postgres:PASSWORD@localhost:5432/safebite` | SQLAlchemy connection string. Replace `PASSWORD`, host, port, and DB name to match your setup. |
| `SECRET_KEY` | ✅ Yes | `a-long-random-secret` | Signing key for JWTs. Use a long, random value. |
| `ALGORITHM` | No | `HS256` | JWT signing algorithm. Defaults to `HS256`. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | `60` | Access-token lifetime in minutes. Defaults to `60`. |

> 🔑 Generate a strong `SECRET_KEY`:
> ```bash
> python -c "import secrets; print(secrets.token_urlsafe(48))"
> ```

### 4. Run database migrations

Alembic applies the versioned schema in [`alembic/versions/`](backend-SB/alembic/versions/). Its `env.py` prefers `DATABASE_URL` from your `.env` over the value in `alembic.ini`, so you don't need to edit the ini file.

```bash
alembic upgrade head
```

### 5. Seed a default admin (optional but recommended)

```bash
python scripts/seed_admin.py
```

This creates a default administrator account. The credentials are defined inside [`scripts/seed_admin.py`](backend-SB/scripts/seed_admin.py) — **change them before deploying anywhere.** The script is idempotent and skips creation if an admin already exists.

### 6. Run the API server

```bash
uvicorn app.main:app --reload
```

The API is now available at `http://127.0.0.1:8000`:

| Endpoint | Purpose |
| --- | --- |
| [`/`](http://127.0.0.1:8000/) | Root — confirms the API is running |
| [`/docs`](http://127.0.0.1:8000/docs) | Interactive Swagger UI |
| [`/health`](http://127.0.0.1:8000/health) | Health check (verifies DB connectivity) |

---

## 🎨 Frontend Setup (`frontend-SB`)

All commands below assume you are in the `frontend-SB` directory:

```bash
cd frontend-SB
```

### 1. Install dependencies

```bash
npm install
```

### 2. Create your `.env` file

Create a file named `.env` in `frontend-SB/` (git-ignored — **never commit real secrets**):

```bash
# frontend-SB/.env
VITE_API_URL=http://127.0.0.1:8000
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-js-api-key
```

| Variable | Required | Example | Description |
| --- | --- | --- | --- |
| `VITE_API_URL` | ✅ Yes | `http://127.0.0.1:8000` | Base URL of the backend API. Must match where your backend is running. |
| `VITE_GOOGLE_MAPS_API_KEY` | For maps | `AIza...` | Google Maps JavaScript API key. Map features stay blank without it. |

> ℹ️ Vite only exposes variables prefixed with `VITE_` to the app, and it reads `.env` **at startup** — restart `npm run dev` after changing it.

### 3. Run the dev server

```bash
npm run dev
```

The app runs at `http://localhost:5173` (Vite's default port).

### Other frontend scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Type-check (`tsc -b`) and build for production into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Lint the codebase with Oxlint |

---

## 🔌 API Reference

- **Base URL (local):** `http://127.0.0.1:8000`
- **Interactive docs:** [`/docs`](http://127.0.0.1:8000/docs) (Swagger UI) — the fastest way to explore and try every endpoint.

Routers are mounted under these prefixes:

| Prefix | Domain |
| --- | --- |
| `/auth` | Registration, login, role-check endpoints |
| `/restaurants` | Restaurant management |
| `/inspections` | Inspection records |
| `/complaints` | Customer complaints |
| `/certificates` | Certificates (with file uploads under `/uploads`) |
| `/safety-scores` | Safety scoring |
| `/admin` | Admin dashboard & management |
| `/notifications` | User notifications |

---

## 👥 User Roles

Access is governed by four roles (see [`app/enums/user_role.py`](backend-SB/app/enums/user_role.py)):

| Role | Description |
| --- | --- |
| `customer` | Browses restaurants and safety details; files complaints |
| `owner` | Registers and manages their restaurant(s) and safety info |
| `inspector` | Performs inspections and manages certificates |
| `admin` | Full platform oversight and management |

---

## 📜 Environment Variables

### Backend — `backend-SB/.env`

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `DATABASE_URL` | ✅ | — | PostgreSQL connection string (`postgresql://user:pass@host:port/db`) |
| `SECRET_KEY` | ✅ | — | JWT signing key |
| `ALGORITHM` | ❌ | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | ❌ | `60` | Token lifetime (minutes) |

### Frontend — `frontend-SB/.env`

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_URL` | ✅ | Backend base URL |
| `VITE_GOOGLE_MAPS_API_KEY` | For maps | Google Maps JavaScript API key |

> 🔒 Both `.env` files are git-ignored. Never commit real credentials — share example values with your team instead.

---

## 🧪 Useful Scripts

| Command | Where | What it does |
| --- | --- | --- |
| `python scripts/seed_admin.py` | `backend-SB/` | Creates a default admin account (idempotent) |
| `python scripts/clear_test_data.py` | `backend-SB/` | Clears test data from the database |
| `alembic upgrade head` | `backend-SB/` | Applies all pending migrations |
| `alembic revision --autogenerate -m "msg"` | `backend-SB/` | Generates a new migration from model changes |
| `npm run build` | `frontend-SB/` | Production build |
| `npm run lint` | `frontend-SB/` | Lint with Oxlint |

---

## 🛠️ Troubleshooting

**`connection refused` / `could not connect to server`**
PostgreSQL isn't running or `DATABASE_URL` is wrong. Start your database (`brew services start postgresql`, `sudo service postgresql start`, or the Windows service) and double-check the host, port, user, password, and DB name in `backend-SB/.env`.

**`type "geometry" does not exist` / PostGIS errors during migration**
PostGIS isn't enabled in your database. Run `psql -d safebite -c "CREATE EXTENSION IF NOT EXISTS postgis;"` and re-run `alembic upgrade head`.

**CORS errors in the browser console**
The backend allows the Vite dev origins (`http://localhost:5173`–`5175` and their `127.0.0.1` equivalents). Run the frontend on one of those ports, and if you use a different origin, add it to the `allow_origins` list in [`app/main.py`](backend-SB/app/main.py).

**Frontend can't reach the API / requests fail**
Check `VITE_API_URL` in `frontend-SB/.env` matches where the backend is running (e.g. `http://127.0.0.1:8000`), and **restart `npm run dev`** after editing `.env`.

**`Port already in use` (8000 or 5173)**
Something is already bound to the port. Either stop it, or run on a different one:
```bash
# Backend on a different port
uvicorn app.main:app --reload --port 8001

# Frontend on a different port
npm run dev -- --port 5174
```
If you change the frontend port, update the backend CORS origins; if you change the backend port, update `VITE_API_URL`.

**`ModuleNotFoundError` when running backend commands**
Your virtual environment isn't active. Re-activate it (`source venv/bin/activate` on macOS/Linux, `venv\Scripts\activate` on Windows) and confirm dependencies are installed with `pip install -r requirements.txt`.

---

## 🤝 Contributing

1. Create a feature branch off `main`: `git checkout -b feature/your-change`
2. Make focused commits with clear messages.
3. Run `npm run lint` (frontend) and verify the backend starts and migrations apply cleanly.
4. Open a pull request against `main` describing what changed and why.

---

## 📄 License & Authors

Built by the SafeBite team. Add your license of choice here (e.g. MIT) before publishing.

> 🚧 SafeBite is under active development — modules and APIs may change.
