# ML Engine Documentation

## Overview

The ML Detection Engine is a FastAPI-based service that analyzes incoming requests and payloads to identify potential security threats. It uses pattern-based detection for SQL Injection, XSS, Command Injection, and Path Traversal attacks.

## Architecture

```
Request → Feature Extraction → Threat Scoring → Classification → Response
```

## Threat Detection Patterns

### SQL Injection
- Keywords: SELECT, INSERT, UPDATE, DELETE, UNION, OR, AND, --, ;
- Scoring: Weight 0.3 (30% of final threat score)

### Cross-Site Scripting (XSS)
- Patterns: `<script>`, `javascript:`, `onerror=`, `onload=`, `<iframe>`, `alert(`
- Scoring: Weight 0.25 (25% of final threat score)

### Command Injection
- Special characters: `;`, `|`, `&`, `$`, `` ` ``, `\n`
- Scoring: Weight 0.25 (25% of final threat score)

### Path Traversal
- Patterns: `../`, `..\\`, `%2e%2e`, `file://`, `/etc/`, `/windows/`
- Scoring: Weight 0.15 (15% of final threat score)

### Encoding Detection
- Identifies: URL encoding (`%xx`), HTML entities (`&#`), Hex (`\x`)
- Scoring: Weight 0.05 (5% of final threat score)

## API Endpoints

### Health Check
```
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "service": "ML Detection Engine"
}
```

---

### Classify Payload
```
POST /api/classify
Content-Type: application/json
```

**Request Body:**
```json
{
  "method": "GET",
  "path": "/api/users",
  "parameter": "id",
  "value": "1' OR '1'='1",
  "userAgent": "Mozilla/5.0..."
}
```

**Response:**
```json
{
  "threat_score": 0.75,
  "attack_type": "sql_injection",
  "is_malicious": true,
  "confidence": 0.92,
  "details": {
    "sql_score": 0.4,
    "xss_score": 0.0,
    "cmd_score": 0.0,
    "path_score": 0.0,
    "encoding_score": 0.0,
    "length": 15,
    "special_chars": 0.53
  }
}
```

---

### Model Status
```
GET /api/model/status
```

**Response:**
```json
{
  "model_loaded": true,
  "detector_type": "hybrid_pattern_detector"
}
```

---

## Threat Scoring

### Score Calculation
```
threat_score = (
  sql_score * 0.30 +
  xss_score * 0.25 +
  cmd_score * 0.25 +
  path_score * 0.15 +
  encoding_score * 0.05
)
```

### Threat Level Interpretation
| Score | Level | Action |
|-------|-------|--------|
| 0.0 - 0.3 | Low | Log only |
| 0.3 - 0.5 | Medium | Alert |
| 0.5 - 0.7 | High | Alert + Log |
| 0.7 - 0.9 | Critical | Block + Alert |
| 0.9 - 1.0 | Severe | Block + Alert + Escalate |

## Feature Engineering

### Extracted Features
1. **Pattern Scores** - Individual threat pattern matching
2. **Payload Length** - Suspicious length patterns
3. **Special Characters Ratio** - Density of non-alphanumeric characters
4. **Encoding Detection** - Presence of URL/HTML/Hex encoding

## Integration

### Backend Integration
```python
# Send request to ML engine
response = requests.post(
    'http://ml-engine:8000/api/classify',
    json={
        'method': 'POST',
        'path': '/api/login',
        'parameter': 'password',
        'value': user_input,
        'userAgent': request.headers.get('User-Agent')
    }
)

threat = response.json()
if threat['is_malicious']:
    block_request()
```

## Performance

- **Response Time:** ~50-100ms per request
- **Throughput:** 1000+ req/sec
- **Memory Usage:** ~100MB
- **CPU Usage:** Minimal (<5%)

## Future Enhancements

1. **ML Model Training:** Support for custom-trained threat models
2. **Pattern Updates:** Real-time pattern database updates
3. **Behavior Analysis:** Anomaly detection based on user behavior
4. **False Positive Feedback:** Learning from misclassifications
5. **Custom Rules:** User-defined threat patterns

## Troubleshooting

### High False Positives
- Review threshold settings
- Add whitelisted parameters
- Update pattern database

### Performance Issues
- Check system resources
- Optimize feature extraction
- Enable caching for repeated payloads

### Model Accuracy
- Gather more training data
- Fine-tune weights
- Collect feedback from users
