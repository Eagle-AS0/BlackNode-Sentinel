# ──────────────────────────────────────────────────────────────
# BlackNode Sentinel — Backend Multi-Stage Dockerfile
# ──────────────────────────────────────────────────────────────

# ── Stage 1: Install dependencies ─────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests first (leverage Docker layer caching)
COPY package*.json ./

# Install ALL dependencies (including devDependencies for potential build steps)
RUN npm install

# ── Stage 2: Production image ─────────────────────────────────
FROM node:20-alpine AS production

# Add curl for health checks
RUN apk add --no-cache curl

# Create non-root user
RUN addgroup -g 1001 -S blacknode && \
    adduser  -S blacknode -u 1001 -G blacknode

WORKDIR /app

# Copy package manifests
COPY package*.json ./

# Install production dependencies only
RUN npm install --omit=dev && npm cache clean --force

# Copy application source
COPY src/ ./src/

# Create logs directory
RUN mkdir -p logs && chown -R blacknode:blacknode /app

# Switch to non-root user
USER blacknode

# Expose backend port
EXPOSE 5004

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:5004/health || exit 1

# Start the application
CMD ["node", "src/index.js"]
