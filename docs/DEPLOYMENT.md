# Deployment Guide

## Prerequisites

- Docker & Docker Compose v2.0+
- Git
- Domain name (for production)
- SSL certificate (for HTTPS)
- Cloud provider account (AWS, GCP, or Azure)

## Quick Start with Docker Compose

### 1. Clone Repository
```bash
git clone https://github.com/Eagle-AS0/BlackNode-Sentinel.git
cd BlackNode-Sentinel
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` with your settings:
```env
NODE_ENV=production
JWT_SECRET=your_secure_random_secret_here
MONGODB_PASSWORD=your_secure_db_password
CORS_ORIGIN=https://yourdomain.com
```

### 3. Start Services
```bash
docker-compose up -d
```

### 4. Verify Services
```bash
# Check containers
docker-compose ps

# View logs
docker-compose logs -f

# Test health endpoints
curl http://localhost:5000/health
curl http://localhost:8000/health
curl http://localhost:3000
```

---

## Production Deployment

### AWS Deployment (ECS)

#### 1. Create ECR Repositories
```bash
aws ecr create-repository --repository-name blacknode/backend
aws ecr create-repository --repository-name blacknode/frontend
aws ecr create-repository --repository-name blacknode/ml-engine
```

#### 2. Push Docker Images
```bash
# Build and push images
docker build -t blacknode-backend ./backend
docker build -t blacknode-frontend ./frontend
docker build -t blacknode-ml-engine ./ml-engine

# Tag for ECR
docker tag blacknode-backend:latest \
  <account-id>.dkr.ecr.<region>.amazonaws.com/blacknode/backend:latest

# Push to ECR
aws ecr get-login-password --region <region> | docker login \
  --username AWS --password-stdin <account-id>.dkr.ecr.<region>.amazonaws.com

docker push <account-id>.dkr.ecr.<region>.amazonaws.com/blacknode/backend:latest
```

#### 3. Create RDS Database
```bash
aws rds create-db-instance \
  --db-instance-identifier blacknode-mongodb \
  --db-instance-class db.t3.micro \
  --engine mongo
```

#### 4. Deploy with CloudFormation/Terraform
```bash
# Use provided CloudFormation template
aws cloudformation create-stack \
  --stack-name blacknode-sentinel \
  --template-body file://deployment/cloudformation.yaml
```

---

### Google Cloud Deployment

#### 1. Build and Push to GCR
```bash
gcloud auth configure-docker
docker tag blacknode-backend gcr.io/$PROJECT_ID/blacknode-backend
docker push gcr.io/$PROJECT_ID/blacknode-backend
```

#### 2. Create GKE Cluster
```bash
gcloud container clusters create blacknode-cluster \
  --zone us-central1-a \
  --num-nodes 3 \
  --machine-type n1-standard-1
```

#### 3. Deploy Services
```bash
kubectl apply -f deployment/kubernetes/
```

---

### Azure Deployment

#### 1. Create Container Registry
```bash
az acr create --resource-group blacknode \
  --name blacknoderegistry --sku Basic
```

#### 2. Push Images
```bash
az acr build --registry blacknoderegistry \
  --image blacknode-backend:latest ./backend
```

#### 3. Deploy to Container Instances
```bash
az container create \
  --resource-group blacknode \
  --name blacknode-backend \
  --image blacknoderegistry.azurecr.io/blacknode-backend:latest
```

---

## Manual Server Deployment

### Ubuntu/Debian VPS

#### 1. Install Dependencies
```bash
sudo apt update
sudo apt install -y docker.io docker-compose nginx git

sudo usermod -aG docker $USER
```

#### 2. Clone and Setup
```bash
git clone https://github.com/Eagle-AS0/BlackNode-Sentinel.git
cd BlackNode-Sentinel
cp .env.example .env
```

#### 3. Configure Nginx
```bash
sudo cp deployment/nginx.conf /etc/nginx/sites-available/blacknode
sudo ln -s /etc/nginx/sites-available/blacknode /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 4. Start Services
```bash
docker-compose up -d

# Setup SSL with Let's Encrypt
sudo certbot certonly --nginx -d yourdomain.com
```

#### 5. Monitor Services
```bash
# Create monitoring script
bash deployment/monitor.sh
```

---

## Environment Variables

### Required
```env
# Backend
BACKEND_PORT=5000
NODE_ENV=production
JWT_SECRET=your_random_secret_key_min_32_chars
MONGODB_URI=mongodb://user:pass@host:27017/db
MONGODB_PASSWORD=secure_password

# ML Engine
ML_ENGINE_URL=http://ml-engine:8000
ML_ENGINE_PORT=8000

# Frontend
FRONTEND_PORT=3000
REACT_APP_API_URL=https://yourdomain.com/api

# Security
CORS_ORIGIN=https://yourdomain.com
```

### Optional
```env
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EVENT_RETENTION_DAYS=30
ENABLE_ML_DETECTION=true
ENABLE_REAL_TIME_ALERTS=true
```

---

## SSL/TLS Configuration

### Using Let's Encrypt
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Create certificate
sudo certbot certonly --nginx -d yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### Update Docker Compose
```yaml
environment:
  - SSL_CERT=/etc/letsencrypt/live/yourdomain.com/fullchain.pem
  - SSL_KEY=/etc/letsencrypt/live/yourdomain.com/privkey.pem
volumes:
  - /etc/letsencrypt:/etc/letsencrypt:ro
```

---

## Database Backup

### Automated MongoDB Backup
```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
mongodump --uri="mongodb://user:pass@host:27017/blacknode-sentinel" \
  --out=/backups/$(date +%Y%m%d_%H%M%S)
EOF

# Schedule with cron
0 2 * * * /path/to/backup.sh
```

### Cloud Backups
- AWS: Use RDS automated backups
- GCP: Use Cloud SQL backups
- Azure: Use automated backups

---

## Monitoring & Logging

### Health Checks
```bash
# Backend
curl http://localhost:5000/health

# ML Engine
curl http://localhost:8000/health

# Frontend
curl http://localhost:3000
```

### Log Aggregation
```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f ml-engine
docker-compose logs -f mongodb

# Export logs
docker-compose logs > logs.txt
```

### Monitoring Services
- Datadog: `docker logs | grep datadog`
- New Relic: APM monitoring
- Prometheus: Metrics collection

---

## Scaling Considerations

### Horizontal Scaling
```yaml
# docker-compose.yml - Multiple instances
services:
  backend:
    deploy:
      replicas: 3
```

### Load Balancing
- Use Nginx upstream
- Cloud load balancers (ALB, NLB)
- DNS round-robin

### Database Scaling
- MongoDB replica sets
- Sharding for large datasets
- Read replicas

---

## Troubleshooting

### Services Won't Start
```bash
# Check logs
docker-compose logs

# Verify ports
netstat -tuln | grep LISTEN

# Check resources
docker stats
```

### Connection Issues
```bash
# Test connectivity
docker-compose exec backend nc -zv mongodb 27017
docker-compose exec backend curl http://ml-engine:8000/health
```

### Performance Issues
```bash
# Monitor resources
docker stats

# Check database indexes
docker-compose exec mongodb mongosh

# Optimize queries
db.securityevents.createIndex({ "createdAt": -1 })
```

---

## Security Checklist

- [ ] Change default passwords
- [ ] Enable HTTPS/SSL
- [ ] Setup firewall rules
- [ ] Configure rate limiting
- [ ] Enable MongoDB authentication
- [ ] Regular security updates
- [ ] Setup automated backups
- [ ] Monitor access logs
- [ ] Use strong JWT secret
- [ ] Enable CORS properly

---

## Support & Resources

- Documentation: [docs/](../docs)
- Issues: [GitHub Issues](https://github.com/Eagle-AS0/BlackNode-Sentinel/issues)
- Security: [SECURITY.md](../SECURITY.md)
