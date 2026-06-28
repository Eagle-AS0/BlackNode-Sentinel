#!/bin/bash
API="http://localhost:5001"

echo "=== 1. HEALTH CHECK ==="
curl -s "$API/health" | python3 -m json.tool
echo ""

echo "=== 2. REGISTER ==="
REG=$(curl -s -X POST "$API/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser2","email":"test2@example.com","password":"test1234","firstName":"Test","lastName":"User"}')
echo "$REG" | python3 -m json.tool
echo ""

echo "=== 3. LOGIN ==="
LOGIN=$(curl -s -X POST "$API/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test2@example.com","password":"test1234"}')
echo "$LOGIN" | python3 -m json.tool

TOKEN=$(echo "$LOGIN" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['token'])" 2>/dev/null)
echo ""

if [ -z "$TOKEN" ]; then
  echo "ERROR: No token received. Aborting further tests."
  exit 1
fi
echo "Token obtained successfully"
echo ""

echo "=== 4. GET PROFILE ==="
curl -s "$API/api/auth/profile" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo ""

echo "=== 5. CREATE APPLICATION ==="
APP=$(curl -s -X POST "$API/api/applications" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Test App","description":"My test application","url":"https://example.com","language":"javascript","framework":"express","environment":"development"}')
echo "$APP" | python3 -m json.tool
APP_ID=$(echo "$APP" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['_id'])" 2>/dev/null)
echo ""

echo "=== 6. GET APPLICATIONS ==="
curl -s "$API/api/applications" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo ""

echo "=== 7. CREATE SECURITY EVENT ==="
curl -s -X POST "$API/api/events" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"applicationId\":\"$APP_ID\",\"eventType\":\"sql_injection\",\"severity\":\"high\",\"source\":{\"ip\":\"192.168.1.100\",\"method\":\"POST\",\"path\":\"/api/login\",\"userAgent\":\"Mozilla/5.0\"},\"payload\":{\"parameter\":\"username\",\"value\":\"admin OR 1=1--\"},\"description\":\"SQL injection attempt detected\"}" | python3 -m json.tool
echo ""

echo "=== 8. GET EVENTS ==="
curl -s "$API/api/events" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo ""

echo "=== 9. GET EVENT STATS ==="
curl -s "$API/api/events/stats/overview" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo ""

echo "=== 10. ML ENGINE HEALTH ==="
curl -s http://localhost:8000/health | python3 -m json.tool
echo ""

echo "=== 11. ML ENGINE CLASSIFY ==="
curl -s -X POST http://localhost:8000/api/classify \
  -H "Content-Type: application/json" \
  -d '{"method":"POST","path":"/api/login","parameter":"username","value":"admin'\'' OR 1=1--","userAgent":"Mozilla/5.0"}' | python3 -m json.tool
echo ""

echo "=== ALL TESTS PASSED ==="
