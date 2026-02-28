# CRTAIS — Climate-Responsive Traditional Architecture Intelligence System

An actionable platform that encodes **vernacular architectural wisdom**, performs **thermal and airflow simulations**, and generates **practitioner-ready reports** for climate-responsive building design.

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" />
  <img src="https://img.shields.io/badge/FastAPI-0.110-009688?logo=fastapi" />
  <img src="https://img.shields.io/badge/PostGIS-3.4-336791?logo=postgresql" />
  <img src="https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb" />
</p>

---

## ✨ Features

| Feature | Status |
|---|---|
| Site intake & geospatial overlay | 🚧 In Progress |
| Rule-based vernacular engine | 🚧 In Progress |
| Fast thermal simulation (hourly) | ⬜ Planned |
| Steady airflow approximation | ⬜ Planned |
| Automated recommendation report | ⬜ Planned |
| Printable masonry briefs | ⬜ Planned |
| Material recommendation library | ⬜ Planned |
| 2D/3D visualization & AR preview | ⬜ Planned |
| Multi-objective optimizer | ⬜ Planned |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────┐
│                    Frontend (Next.js 14)              │
│   Dashboard · Site Intake · Map View · Rule Browser  │
└──────────────┬───────────────────────┬───────────────┘
               │  REST API             │
┌──────────────▼───────────────────────▼───────────────┐
│                   Backend (FastAPI)                    │
│   Sites API · Rules API · Simulation Services         │
└──────┬────────────────┬──────────────────┬───────────┘
       │                │                  │
┌──────▼──────┐  ┌──────▼──────┐  ┌───────▼───────┐
│  PostGIS    │  │  MongoDB    │  │  Simulation   │
│  (spatial)  │  │  (rules/    │  │  (pvlib,      │
│             │  │   materials)│  │   RC thermal) │
└─────────────┘  └─────────────┘  └───────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **Python** ≥ 3.11
- **Docker** & Docker Compose

### 1. Start databases

```bash
docker-compose up -d
```

### 2. Start the backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard.  
API docs at [http://localhost:8000/docs](http://localhost:8000/docs).

---

## 📁 Project Structure

```
CRTAIS/
├── frontend/          # Next.js 14 + Tailwind CSS
├── backend/           # FastAPI (Python)
├── schemas/           # Shared JSON schemas
├── data/              # Seed & reference data
├── docker-compose.yml # PostGIS + MongoDB
└── README.md
```

---

## 📄 License

MIT © 2026 CRTAIS Contributors
