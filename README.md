# BlackNode Sentinel

AI-Powered Runtime Application Self-Protection (RASP) SaaS Platform

BlackNode Sentinel monitors web applications during runtime, detects malicious activity, and provides a security dashboard to analyze threats in real time.

## 🚀 What’s inside

- **Backend**: Node.js + Express API
- **Frontend**: React dashboard
- **ML Engine**: Python + FastAPI threat detection
- **Database**: MongoDB
- **Orchestration**: Docker Compose

## 📁 Project structure

```
BlackNode-Sentinel/
├── backend/              # Node.js API
├── frontend/             # React dashboard
├── ml-engine/            # Python FastAPI ML detection service
├── docker-compose.yml    # Local development orchestration
└── docs/                 # Project documentation
```

## ✅ Quick start (recommended)

### Prerequisites

- Docker
- Docker Compose
- Git

### Run with Docker Compose

```bash
cd /lackNode-Sentinel
docker compose up --build
```

Then open:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`
- ML Engine: `http://localhost:8000`

## 🔧 Local development (without Docker)

### 1. Start MongoDB

If you do not have MongoDB installed locally, use Docker:

```bash
docker run -d --name blacknode-mongodb -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=blacknode_user \
  -e MONGO_INITDB_ROOT_PASSWORD=blacknode_pass \
  mongo:latest
```

### 2. Backend

```bash
cd BlackNode-Sentinel/backend
npm install
export MONGODB_URI="mongodb://blacknode_user:blacknode_pass@localhost:27017/blacknode-sentinel?authSource=admin"
export JWT_SECRET="your_secret_here"
export CORS_ORIGIN="http://localhost:3000"
export ML_ENGINE_URL="http://localhost:8000"
npm run dev
```

The backend will start on `http://localhost:5000`.

### 3. ML Engine

```bash
cd BlackNode-Sentinel/ml-engine
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The ML engine will start on `http://localhost:8000`.

### 4. Frontend

```bash
cd BlackNode-Sentinel/frontend
npm install
export REACT_APP_API_URL="http://localhost:5000/api"
npm start
```

The frontend will start on `http://localhost:3000`.

## 🧩 Environment variables

The project uses environment variables to configure services. Common variables include:

```env
MONGODB_URI=mongodb://blacknode_user:blacknode_pass@mongodb:27017/blacknode-sentinel?authSource=admin
JWT_SECRET=your_secret_here
CORS_ORIGIN=http://localhost:3000
ML_ENGINE_URL=http://localhost:8000
REACT_APP_API_URL=http://localhost:5000/api
```

## 📌 Notes

- The repository currently uses **MongoDB**, not PostgreSQL.
- The Docker Compose file exposes:
  - `3000` for frontend
  - `5000` for backend
  - `8000` for ML engine
  - `27017` for MongoDB
- If you want, copy this README content into a new `.env` file or update your environment values before running.

## 📚 Useful commands

```bash
# Start all services with Docker Compose
docker compose up --build

# Stop services
docker compose down

# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

## 💡 Help

If you need help running the project, use the `docs/` folder for architecture and deployment details, or ask for a specific error message if something fails.
