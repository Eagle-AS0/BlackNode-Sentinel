# ──────────────────────────────────────────────────────────────
# BlackNode Sentinel — Frontend Multi-Stage Dockerfile
# ──────────────────────────────────────────────────────────────

# ── Stage 1: Build React app ──────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests first (leverage Docker layer caching)
COPY package*.json ./

# Install ALL dependencies
RUN npm ci

# Build argument for API URL (injected at build time)
ARG REACT_APP_API_URL=/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Copy source code
COPY public/ ./public/
COPY src/ ./src/
COPY tailwind.config.js postcss.config.js .env* ./
# Include any config files at root (e.g., craco.config.js)
COPY *.config.js ./
# Copy package.json for build metadata
COPY package.json ./

# Build the React app
RUN npm run build

# ── Stage 2: Serve with Nginx ─────────────────────────────────
FROM nginx:alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Remove default nginx config
RUN rm -f /etc/nginx/conf.d/default.conf

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built React app from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Expose frontend port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
