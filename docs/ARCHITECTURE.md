# Architecture Documentation

## System Overview

BlackNode Sentinel is a microservices-based RASP (Runtime Application Self-Protection) platform designed for detecting and preventing runtime application threats in real-time.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Applications                       │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RASP Agent (SDK/Middleware)                   │
│  • Request Interception  • Payload Extraction  • Real-time Monitoring
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BlackNode Sentinel API                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Express.js Backend                                       │   │
│  │  • Authentication & Authorization                         │   │
│  │  • Event Processing                                       │   │
│  │  • Alert Management                                       │   │
│  │  • Analytics & Reporting                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
              │                              │
              ▼                              ▼
    ┌──────────────────┐      ┌──────────────────────┐
    │  ML Detection    │      │  MongoDB Database    │
    │  Engine          │      │  • Users             │
    │  (FastAPI)       │      │  • Organizations     │
    │                  │      │  • Applications      │
    │  • Pattern       │      │  • Events            │
    │    Detection     │      │  • Alerts            │
    │  • Threat        │      │  • Logs              │
    │    Scoring       │      └──────────────────────┘
    │  • Classification│
    └──────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  React Dashboard (Frontend)                      │
│  • Real-time Analytics  • Event Monitoring  • Alert Management   │
│  • Application Management  • User Settings  • Reports            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### 1. Backend API (Node.js/Express)

**Responsibilities:**
- RESTful API endpoints
- JWT authentication & authorization
- Business logic processing
- Event ingestion & logging
- Real-time alert generation

**Key Components:**
```
backend/src/
├── config/          # Configuration files
│   ├── database.js  # MongoDB connection
│   ├── logger.js    # Winston logger setup
│   └── jwt.js       # JWT token utilities
├── models/          # Mongoose schemas
│   ├── User.js
│   ├── Organization.js
│   ├── Application.js
│   ├── SecurityEvent.js
│   └── Alert.js
├── controllers/     # Request handlers
│   ├── authController.js
│   ├── applicationController.js
│   └── eventController.js
├── services/        # Business logic
│   ├── authService.js
│   ├── applicationService.js
│   └── eventService.js
├── middleware/      # Express middleware
│   └── auth.js
├── routes/          # API routes
│   ├── auth.js
│   ├── applications.js
│   └── events.js
└── index.js         # Main server file
```

**Workflow:**
```
Request → Middleware → Route → Controller → Service → Database → Response
         (Auth/Logger)         (Validation)  (Logic)
```

---

### 2. ML Detection Engine (Python/FastAPI)

**Responsibilities:**
- Threat pattern detection
- ML-based classification
- Threat scoring
- Real-time payload analysis

**Architecture:**
```
Input Payload
    │
    ▼
Feature Extraction
    │
    ├─── SQL Injection Score
    ├─── XSS Score
    ├─── Command Injection Score
    ├─── Path Traversal Score
    └─── Encoding Detection Score
    │
    ▼
Weighted Score Calculation
    │
    ▼
Attack Type Classification
    │
    ▼
Threat Level Assessment
    │
    ▼
Response (threat_score, attack_type, is_malicious)
```

**Threat Detection:**
- Pattern-based detection
- Feature engineering
- Weighted scoring
- Real-time classification

---

### 3. Frontend Dashboard (React)

**Responsibilities:**
- User interface
- Real-time data visualization
- Authentication flow
- Event monitoring & analytics

**Key Features:**
- Login/Register pages
- Dashboard with analytics
- Application management
- Event logging & filtering
- Alert configuration

---

### 4. Database (MongoDB)

**Schema Design:**

#### Users Collection
```
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String (hashed),
  firstName: String,
  lastName: String,
  organization: ObjectId,
  role: String (admin|user|viewer),
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### Organizations Collection
```
{
  _id: ObjectId,
  name: String,
  owner: ObjectId,
  apiKey: String,
  members: Array,
  settings: {
    enableRealTimeAlerts: Boolean,
    enableMLDetection: Boolean,
    alertThreshold: Number,
    eventRetentionDays: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### Applications Collection
```
{
  _id: ObjectId,
  name: String,
  organization: ObjectId,
  agentKey: String,
  description: String,
  url: String,
  language: String,
  framework: String,
  environment: String (dev|staging|prod),
  status: String (active|inactive|archived),
  isMonitoring: Boolean,
  threatLevel: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### SecurityEvents Collection
```
{
  _id: ObjectId,
  application: ObjectId,
  organization: ObjectId,
  eventType: String (sql_injection|xss|path_traversal|command_injection|suspicious|anomaly),
  severity: String (critical|high|medium|low|info),
  source: {
    ip: String,
    method: String,
    path: String,
    userAgent: String
  },
  payload: {
    parameter: String,
    value: String
  },
  mlScore: Number,
  blocked: Boolean,
  tags: Array,
  description: String,
  response: {
    statusCode: Number,
    message: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### Alerts Collection
```
{
  _id: ObjectId,
  application: ObjectId,
  organization: ObjectId,
  event: ObjectId,
  title: String,
  description: String,
  severity: String,
  status: String (open|acknowledged|resolved),
  assignedTo: ObjectId,
  channels: {
    email: Boolean,
    slack: Boolean,
    webhook: Boolean
  },
  notes: Array,
  resolvedAt: Date,
  resolvedBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Data Flow

### Event Creation Flow
```
1. Client App detects request
   ↓
2. RASP Agent intercepts payload
   ↓
3. Agent sends to API endpoint
   ↓
4. Backend extracts features
   ↓
5. Backend forwards to ML Engine
   ↓
6. ML Engine classifies threat
   ↓
7. Backend stores SecurityEvent
   ↓
8. Alert triggered if threshold exceeded
   ↓
9. Frontend updates in real-time
   ↓
10. Block decision made (if necessary)
```

### Authentication Flow
```
1. User submits credentials
   ↓
2. Backend validates credentials
   ↓
3. Backend generates JWT token
   ↓
4. Frontend stores token in localStorage
   ↓
5. Subsequent requests include token in header
   ↓
6. Backend verifies token
   ↓
7. Request processed
```

---

## Security Architecture

### Defense Layers

```
┌─────────────────────────────────────┐
│        Application Level             │
│  - Input Validation                 │
│  - Output Encoding                  │
│  - CSRF Protection                  │
└─────────────────────────────────────┘
              ▼
┌─────────────────────────────────────┐
│        API Level                    │
│  - JWT Authentication               │
│  - Rate Limiting                    │
│  - CORS Policy                      │
│  - Helmet Security Headers          │
└─────────────────────────────────────┘
              ▼
┌─────────────────────────────────────┐
│        Detection Level               │
│  - Pattern Detection                │
│  - Anomaly Detection                │
│  - Behavior Analysis                │
└─────────────────────────────────────┘
              ▼
┌─────────────────────────────────────┐
│        Response Level                │
│  - Request Blocking                 │
│  - Alert Generation                 │
│  - Log Aggregation                  │
│  - Forensic Analysis                │
└─────────────────────────────────────┘
```

---

## Scalability Considerations

### Horizontal Scaling
- Multiple backend instances behind load balancer
- ML engine can be scaled independently
- Stateless services allow horizontal scaling

### Database Scaling
- MongoDB replication for high availability
- Sharding for large datasets
- Read replicas for analytics queries

### Performance Optimization
- Caching layer (Redis) for frequently accessed data
- Database indexing on frequently queried fields
- Request deduplication for events
- Batch processing for log aggregation

---

## Deployment Architecture

### Single Server (Development)
```
┌─────────────────────────────────────┐
│      Docker Host (Single Server)     │
│  ┌───────────────────────────────┐  │
│  │ Backend Container             │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ ML Engine Container           │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ Frontend Container            │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ MongoDB Container             │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Multi-Server (Production)
```
┌─────────────────────────────────────────────────────┐
│  Load Balancer / Nginx                              │
└─────────────────────────────────────────────────────┘
  │                    │                    │
  ▼                    ▼                    ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Backend 1   │  │  Backend 2   │  │  Backend 3   │
│   (Node.js)  │  │   (Node.js)  │  │   (Node.js)  │
└──────────────┘  └──────────────┘  └──────────────┘
                        │
                        ▼
            ┌─────────────────────────┐
            │ MongoDB Replica Set     │
            │  Primary + Secondaries  │
            └─────────────────────────┘
```

---

## Monitoring & Observability

### Metrics
- Request count & latency
- Database query performance
- ML engine inference time
- Error rates
- Alert generation rate

### Logging
- Application logs (Winston)
- Access logs (Nginx)
- Database logs
- Error logs with stack traces

### Alerting
- Service health checks
- Error rate thresholds
- Performance degradation
- Security event alerts

---

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| API Gateway | Nginx | Reverse proxy, load balancing |
| Backend | Express.js | REST API server |
| Database | MongoDB | NoSQL storage |
| ML Engine | FastAPI | Threat detection service |
| Frontend | React | User dashboard |
| Auth | JWT | Token-based authentication |
| Logging | Winston | Application logging |
| Container | Docker | Containerization |
| Orchestration | Docker Compose | Local development |

---

## Future Architecture Improvements

1. **Message Queue** - Kafka for event streaming
2. **Caching Layer** - Redis for performance
3. **Kubernetes** - Production orchestration
4. **Distributed Tracing** - Jaeger/Zipkin for observability
5. **Graph Database** - For relationship analysis
6. **Vector Database** - For semantic threat analysis
