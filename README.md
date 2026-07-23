# Museum Collection App

## Overview
A full-stack Museum Collection Management System developed as part of an internship assignment. It allows authenticated users to manage a museum's collection of artists and artworks through a React frontend, a FastAPI backend, and a PostgreSQL database running in Docker with persistent storage.

## Tech Stack
- **Frontend:** React (Vite), React Router, Axios
- **Backend:** FastAPI, SQLAlchemy, JWT authentication
- **Database:** PostgreSQL (Dockerized, with persistent local storage)

## Project Structure

```
museum-fullstack-app/
 ├── backend/
 ├── frontend/
 ├── docker-compose.yml
 ├── README.md
 └── pgdata/
```

## Features
- Secure login (JWT-based authentication, bcrypt-hashed passwords)
- Dashboard with live summary statistics (total counts, nationality/   department/gender/classification breakdowns)
- Full CRUD for Artists and Artworks
- Bulk insert and bulk delete for both tables
- Search (by name/title or ID) and sort (newest/oldest/alphabetical)
- Confirmation modal + undo window before deletions

## Assignment Coverage
- ✅ Authentication
- ✅ PostgreSQL with Docker and persistent volume
- ✅ Artists CRUD
- ✅ Artworks CRUD
- ✅ Bulk insert
- ✅ Bulk delete
- ✅ Dashboard & summary statistics
- ✅ REST API using FastAPI
- ✅ React frontend

## Prerequisites
- Docker Desktop
- Python 3.11+
- Node.js 18+

## Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/Ashwathkrish2003/museum-fullstack-app.git
cd museum-fullstack-app
```

### 2. Start PostgreSQL (Docker)
```bash
docker compose up -d
```
This starts a PostgreSQL container with data persisted to a local `./pgdata` folder — data survives container restarts.

### 3. Set up the backend
```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Seed the database
```bash
python -m app.seed
```
This creates the tables, seeds one admin user, and loads sample data (500 artists, 500 artworks) from the included CSV files.

**Note:** Since sample data uses explicit IDs from the source CSVs, run these two commands once after seeding to keep auto-increment sequences in sync:
```bash
docker exec -it museum_db psql -U admin -d museum -c "SELECT setval('artists_id_seq', (SELECT MAX(id) FROM artists));"
docker exec -it museum_db psql -U admin -d museum -c "SELECT setval('artworks_id_seq', (SELECT MAX(id) FROM artworks));"
```

### 5. Start the backend server
```bash
uvicorn app.main:app --reload
```
API available at `http://localhost:8000`, interactive docs at `http://localhost:8000/docs`.

#### API Documentation
FastAPI automatically generates interactive API documentation.

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

### 6. Start the frontend
```bash
cd ../frontend
npm install
npm run dev
```
App available at `http://localhost:5173`.

## Login Credentials
```text
Username: admin
Password: admin123
```

## Notes / Design Decisions
- Loaded a 500-record subset of each table (rather than the full ~15,000 artists / ~130,000 artworks) to keep setup fast; the seed script can be adjusted to load more.
- `artist_id` on Artworks is a nullable foreign key — artworks without a known/loaded artist show as unlinked, matching real-world cataloging where an artwork's creator isn't always known at intake.
- Schema excludes fields not relevant to core functionality (physical dimensions, internal museum reference numbers, image URLs) and avoids duplicating artist info into the Artworks table, using the foreign key relationship instead.