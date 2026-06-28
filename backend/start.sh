#!/bin/bash
export MONGODB_URI="mongodb://blacknode_user:***@localhost:27017/blacknode-sentinel?authSource=admin"
export JWT_SECRET=***
export CORS_ORIGIN="http://localhost:3000"
export ML_ENGINE_URL="http://localhost:8000"
cd "$(dirname "$0")"
exec node src/index.js
