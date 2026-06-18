# BlackNode Sentinel - AI-Powered RASP Platform

A comprehensive security monitoring platform for detecting and preventing runtime application threats.

## 📋 Project Structure

```
BlackNode-Sentinel/
├── backend/              # Node.js/Express API
│   ├── src/
│   │   ├── config/      # Database, JWT, Logger config
│   │   ├── models/      # MongoDB schemas
│   │   ├── controllers/ # API controllers
│   │   ├── services/    # Business logic
│   │   ├── routes/      # API routes
│   │   ├── middleware/  # Auth, error handling
│   │   └── index.js     # Main server file
│   ├── package.json
│   └── Dockerfile
├── frontend/             # React Dashboard
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── context/     # Auth context
│   │   ├── hooks/       # Custom hooks
│   │   └── App.jsx      # Root component
│   ├── package.json
│   ├── tailwind.config.js
│   └── Dockerfile
├── ml-engine/            # Python FastAPI ML Service
│   ├── main.py          # FastAPI app with threat detection
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml    # Orchestration
└── .env.example          # Environment template
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose (recommended)
- Node.js 18+
- Python 3.11+ (if running locally)

### Using Docker Compose

1. Clone the repository:
```bash
git clone https://github.com/Eagle-AS0/BlackNode-Sentinel.git
cd BlackNode-Sentinel
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your settings
```

3. Start all services:
```bash
docker-compose up --build
```

4. Access the dashboard:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- ML Engine: http://localhost:8000
- MongoDB: mongodb://localhost:27017

### Local Setup

#### Backend
```bash
cd backend
npm install
npm run dev
```

#### ML Engine
```bash
cd ml-engine
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires auth)

### Applications
- `POST /api/applications` - Create new application
- `GET /api/applications` - List applications
- `GET /api/applications/:id` - Get application details
- `PUT /api/applications/:id` - Update application
- `DELETE /api/applications/:id` - Delete application

### Security Events
- `POST /api/events` - Log security event
- `GET /api/events` - Get events (with filters)
- `GET /api/events/stats/overview` - Get event statistics

## 🔐 Features

### Core Security
- ✅ SQL Injection Detection
- ✅ Cross-Site Scripting (XSS) Detection
- ✅ Command Injection Detection
- ✅ Path Traversal Detection
- ✅ Threat Scoring & Classification
- ✅ Real-time Event Logging

### Platform Features
- ✅ Multi-tenant Architecture
- ✅ JWT Authentication
- ✅ Role-based Access Control
- ✅ Real-time Analytics Dashboard
- ✅ Event Filtering & Search
- ✅ Alert Management
- ✅ ML-based Threat Classification

## 🛠 Tech Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** MongoDB
- **Auth:** JWT
- **Validation:** Mongoose

### Frontend
- **Framework:** React 18
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **HTTP Client:** Axios
- **Routing:** React Router v6

### ML Engine
- **Framework:** FastAPI
- **ML:** Scikit-learn
- **Pattern Detection:** Hybrid approach

### Infrastructure
- **Containerization:** Docker
- **Orchestration:** Docker Compose
- **Reverse Proxy:** Nginx

## 📊 Database Schema

### Models
- **User** - User accounts and profiles
- **Organization** - Team/company management
- **Application** - Monitored applications
- **SecurityEvent** - Logged security threats
- **Alert** - Alert configurations and history

## 🔌 ML Engine API

### Classification Endpoint
```
POST /api/classify
Content-Type: application/json

{
  "method": "GET|POST|PUT|DELETE",
  "path": "/api/endpoint",
  "parameter": "param_name",
  "value": "user_input",
  "userAgent": "Mozilla/5.0..."
}

Response:
{
  "threat_score": 0.75,
  "attack_type": "sql_injection",
  "is_malicious": true,
  "confidence": 0.92,
  "details": {...}
}
```

## 🧪 Testing

### Run tests
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

## 📖 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Submit pull request

## 📝 License

This project is licensed under the MIT License - see LICENSE file for details.

## 🙋 Support

- GitHub Issues: [Report bugs](https://github.com/Eagle-AS0/BlackNode-Sentinel/issues)
- Documentation: [Read docs](./docs)
- Security: See [SECURITY.md](./SECURITY.md)

## 🔐 Security

For security vulnerabilities, please email security@blacknode-sentinel.dev instead of using the issue tracker.

---

**Built with ❤️ for application security**
