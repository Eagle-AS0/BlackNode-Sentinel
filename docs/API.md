# BlackNode Sentinel - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepass123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "john_doe",
      "email": "john@example.com",
      "role": "user"
    },
    "token": "eyJhbGc..."
  }
}
```

---

### Login User
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {...},
    "token": "eyJhbGc..."
  }
}
```

---

### Get Profile
**GET** `/auth/profile`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user",
    "organization": {...}
  }
}
```

---

## Application Endpoints

### Create Application
**POST** `/applications`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "My Web App",
  "description": "Production web application",
  "url": "https://myapp.com",
  "language": "javascript",
  "framework": "express",
  "environment": "production"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Application created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "name": "My Web App",
    "agentKey": "uuid-v4-string",
    "status": "inactive"
  }
}
```

---

### List Applications
**GET** `/applications?page=1&limit=10`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

---

### Get Application
**GET** `/applications/:id`

**Response (200):**
```json
{
  "success": true,
  "data": {...}
}
```

---

### Update Application
**PUT** `/applications/:id`

**Request Body:**
```json
{
  "name": "Updated Name",
  "environment": "production",
  "isMonitoring": true
}
```

---

### Delete Application
**DELETE** `/applications/:id`

---

## Event Endpoints

### Create Event
**POST** `/events`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "applicationId": "507f1f77bcf86cd799439012",
  "eventType": "sql_injection",
  "severity": "high",
  "source": {
    "ip": "192.168.1.1",
    "method": "GET",
    "path": "/api/users",
    "userAgent": "Mozilla/5.0..."
  },
  "payload": {
    "parameter": "id",
    "value": "1' OR '1'='1"
  },
  "blocked": true
}
```

---

### List Events
**GET** `/events?page=1&limit=10&severity=critical&applicationId=xxx`

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `severity` - critical|high|medium|low|info
- `eventType` - Event type filter
- `applicationId` - Filter by application
- `dateFrom` - Start date (ISO 8601)
- `dateTo` - End date (ISO 8601)

**Response (200):**
```json
{
  "success": true,
  "data": [...],
  "pagination": {...}
}
```

---

### Get Event Statistics
**GET** `/events/stats/overview`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total": [{count: 150}],
    "bySeverity": [
      {_id: "critical", count: 10},
      {_id: "high", count: 25}
    ],
    "byType": [
      {_id: "sql_injection", count: 45},
      {_id: "xss", count: 30}
    ],
    "blocked": [{count: 95}]
  }
}
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid token"
}
```

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error message"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Rate Limiting

- **Window:** 15 minutes
- **Limit:** 100 requests per window
- **Response Header:** `X-RateLimit-*`

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 500 | Server Error |

