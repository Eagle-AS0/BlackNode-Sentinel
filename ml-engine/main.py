from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging
from typing import Optional
import joblib
import os

# Configure logging
logging.basicConfig(level=os.getenv('LOG_LEVEL', 'info').upper())
logger = logging.getLogger(__name__)

app = FastAPI(title="BlackNode Sentinel - ML Detection Engine")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request model
class PayloadAnalysis(BaseModel):
    method: Optional[str] = None
    path: Optional[str] = None
    parameter: Optional[str] = None
    value: Optional[str] = None
    userAgent: Optional[str] = None

# Response model
class ClassificationResponse(BaseModel):
    threat_score: float
    attack_type: str
    is_malicious: bool
    confidence: float
    details: dict

class Model:
    def __init__(self):
        self.model = None
        self.load_model()
    
    def load_model(self):
        """Load pre-trained model or create default detector"""
        try:
            model_path = 'models/threat_detector.joblib'
            if os.path.exists(model_path):
                self.model = joblib.load(model_path)
                logger.info("Model loaded successfully")
            else:
                logger.warning("Model file not found, using default detector")
                self.model = None
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            self.model = None

threat_detector = Model()

def extract_features(payload: PayloadAnalysis) -> dict:
    """Extract features from payload for threat detection"""
    value = (payload.value or "") + " " + (payload.path or "")
    
    # SQL Injection patterns — keyword + syntax combo
    sql_keywords = ['select', 'insert', 'update', 'delete', 'drop', 'union', 'or', 'and', '--', ';', '1=1', "1='1'", 'or 1', 'sleep(', 'benchmark(', 'information_schema']
    sql_hits = sum(1 for kw in sql_keywords if kw.lower() in value.lower())
    sql_score = min(sql_hits / 3.0, 1.0)  # 3 hits = max score

    # XSS patterns
    xss_patterns = ['<script', 'javascript:', 'onerror=', 'onload=', '<iframe', 'alert(', '<img', 'document.cookie', 'eval(', 'innerHTML']
    xss_hits = sum(1 for p in xss_patterns if p.lower() in value.lower())
    xss_score = min(xss_hits / 2.0, 1.0)  # 2 hits = max

    # Command Injection patterns
    cmd_patterns = ['|', '&', '`', '$(', 'nc ', 'curl ', 'wget ', 'bash', '/bin/', 'sh -c']
    cmd_hits = sum(1 for p in cmd_patterns if p.lower() in value.lower())
    cmd_score = min(cmd_hits / 2.0, 1.0)

    # Path Traversal patterns — also handle URL encoding
    path_patterns = ['../', '..\\', '%2e%2e', 'file://', '/etc/', '/windows/', '%2f', '%5c']
    path_hits = sum(1 for p in path_patterns if p.lower() in value.lower())
    path_score = min(path_hits / 2.0, 1.0)

    # Encoding detection
    encoding_score = 0
    if '%' in value or '&#' in value or '\\x' in value.lower():
        encoding_score = 0.3

    return {
        'sql_score': sql_score,
        'xss_score': xss_score,
        'cmd_score': cmd_score,
        'path_score': path_score,
        'encoding_score': encoding_score,
        'length': len(value),
        'special_chars': sum(1 for c in value if not c.isalnum() and c != ' ') / max(len(value), 1)
    }

def classify_threat(features: dict) -> tuple:
    """Classify threat based on features"""
    sql_score = features['sql_score']
    xss_score = features['xss_score']
    cmd_score = features['cmd_score']
    path_score = features['path_score']
    encoding_score = features['encoding_score']
    
    # Weighted threat scoring
    threat_score = (
        sql_score * 0.3 +
        xss_score * 0.25 +
        cmd_score * 0.25 +
        path_score * 0.15 +
        encoding_score * 0.05
    )
    
    # Determine attack type
    if sql_score > xss_score and sql_score > cmd_score and sql_score > path_score:
        attack_type = 'sql_injection'
    elif xss_score > sql_score and xss_score > cmd_score and xss_score > path_score:
        attack_type = 'xss'
    elif cmd_score > sql_score and cmd_score > xss_score and cmd_score > path_score:
        attack_type = 'command_injection'
    elif path_score > sql_score and path_score > xss_score and path_score > cmd_score:
        attack_type = 'path_traversal'
    else:
        attack_type = 'suspicious'
    
    is_malicious = threat_score > 0.2
    confidence = min(threat_score * 1.2, 1.0) if is_malicious else max(1.0 - threat_score, 0.0)
    
    return threat_score, attack_type, is_malicious, confidence

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "OK", "service": "ML Detection Engine"}

@app.post("/api/classify", response_model=ClassificationResponse)
async def classify(payload: PayloadAnalysis):
    """Classify payload for threats"""
    try:
        # Extract features from payload
        features = extract_features(payload)
        
        # Classify threat
        threat_score, attack_type, is_malicious, confidence = classify_threat(features)
        
        logger.info(f"Payload classified - Type: {attack_type}, Score: {threat_score:.2f}")
        
        return ClassificationResponse(
            threat_score=threat_score,
            attack_type=attack_type,
            is_malicious=is_malicious,
            confidence=confidence,
            details=features
        )
    except Exception as e:
        logger.error(f"Classification error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/model/status")
async def model_status():
    """Get model status"""
    return {
        "model_loaded": threat_detector.model is not None,
        "detector_type": "hybrid_pattern_detector"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
