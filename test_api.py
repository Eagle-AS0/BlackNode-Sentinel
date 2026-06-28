#!/usr/bin/env python3
"""End-to-end API test for BlackNode-Sentinel"""
import json
import urllib.request
import sys

API = "http://localhost:5002"
ML_API = "http://localhost:8000"
passed = 0
failed = 0

def req(method, url, data=None, token=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    body = json.dumps(data).encode() if data else None
    r = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        resp = urllib.request.urlopen(r)
        return json.loads(resp.read().decode()), resp.status
    except urllib.error.HTTPError as e:
        return json.loads(e.read().decode()), e.code

def check(name, condition, detail=""):
    global passed, failed
    if condition:
        passed += 1
        print(f"  ✅ {name}")
    else:
        failed += 1
        print(f"  ❌ {name} — {detail}")

print("=" * 50)
print("BlackNode-Sentinel — Full API Test Suite")
print("=" * 50)

# 1. Health
print("\n[1] Backend Health Check")
data, code = req("GET", f"{API}/health")
check("Status 200", code == 200)
check("Status OK", data.get("status") == "OK")

# 2. Register
print("\n[2] User Registration")
data, code = req("POST", f"{API}/api/auth/register", {
    "username": "e2etest",
    "email": "e2e@test.com",
    "password": "test1234",
    "firstName": "E2E",
    "lastName": "Tester"
})
check("Status 201", code == 201)
check("Success flag", data.get("success") is True)
token = data.get("data", {}).get("token")
check("Token returned", token is not None and len(token) > 50, f"got: {type(token)}")

if not token:
    print("\n  ⛔ Cannot continue without a valid token.")
    sys.exit(1)

# 3. Login
print("\n[3] User Login")
data, code = req("POST", f"{API}/api/auth/login", {
    "email": "e2e@test.com",
    "password": "test1234"
})
check("Status 200", code == 200)
check("Success flag", data.get("success") is True)
login_token = data.get("data", {}).get("token")
check("Login token returned", login_token is not None and len(login_token) > 50)

# Use register token (has org from creation)
use_token = token

# 4. Profile
print("\n[4] Get Profile")
data, code = req("GET", f"{API}/api/auth/profile", token=use_token)
check("Status 200", code == 200)
check("Success flag", data.get("success") is True)
user = data.get("data", {})
check("Has username", user.get("username") == "e2etest")
check("Has organization", user.get("organization") is not None, f"org: {user.get('organization')}")

# 5. Create Application
print("\n[5] Create Application")
data, code = req("POST", f"{API}/api/applications", {
    "name": "E2E Test App",
    "description": "Automated test application",
    "url": "https://e2e.test.com",
    "language": "javascript",
    "framework": "express",
    "environment": "development"
}, token=use_token)
check("Status 201", code == 201, f"got {code}: {data}")
check("Success flag", data.get("success") is True)
app_id = data.get("data", {}).get("_id")
check("App ID returned", app_id is not None, f"got: {app_id}")

# 6. Get Applications
print("\n[6] Get Applications")
data, code = req("GET", f"{API}/api/applications", token=use_token)
check("Status 200", code == 200)
check("Success flag", data.get("success") is True)
check("Has apps list", isinstance(data.get("data"), list))
check("At least 1 app", len(data.get("data", [])) >= 1)

# 7. Create Security Event
print("\n[7] Create Security Event")
data, code = req("POST", f"{API}/api/events", {
    "applicationId": app_id,
    "eventType": "sql_injection",
    "severity": "high",
    "source": {
        "ip": "10.0.0.1",
        "method": "POST",
        "path": "/api/login",
        "userAgent": "Mozilla/5.0"
    },
    "payload": {
        "parameter": "username",
        "value": "admin OR 1=1--"
    },
    "description": "SQL injection attempt detected"
}, token=use_token)
check("Status 201", code == 201, f"got {code}: {data}")
check("Success flag", data.get("success") is True)
event_id = data.get("data", {}).get("_id")
check("Event ID returned", event_id is not None)

# 8. Get Events
print("\n[8] Get Events")
data, code = req("GET", f"{API}/api/events", token=use_token)
check("Status 200", code == 200)
check("Success flag", data.get("success") is True)
check("Has events list", isinstance(data.get("data"), list))
check("At least 1 event", len(data.get("data", [])) >= 1)

# 9. Event Stats
print("\n[9] Event Stats")
data, code = req("GET", f"{API}/api/events/stats/overview", token=use_token)
check("Status 200", code == 200)
check("Success flag", data.get("success") is True)
check("Has stats data", data.get("data") is not None)

# 10. ML Engine Health
print("\n[10] ML Engine Health")
data, code = req("GET", f"{ML_API}/health")
check("Status 200", code == 200)
check("Status OK", data.get("status") == "OK")

# 11. ML Classify
print("\n[11] ML Engine Classify")
data, code = req("POST", f"{ML_API}/api/classify", {
    "method": "POST",
    "path": "/api/login",
    "parameter": "username",
    "value": "admin' OR 1=1--",
    "userAgent": "Mozilla/5.0"
})
check("Status 200", code == 200)
check("Has threat_score", "threat_score" in data)
check("Has attack_type", data.get("attack_type") == "sql_injection")
check("Has confidence", "confidence" in data)

# 12. Auth without token
print("\n[12] Auth Guard (no token)")
data, code = req("GET", f"{API}/api/auth/profile")
check("Returns 401", code == 401, f"got {code}")

# Summary
print("\n" + "=" * 50)
total = passed + failed
print(f"Results: {passed}/{total} passed, {failed} failed")
if failed == 0:
    print("🎉 ALL TESTS PASSED — Project is fully working!")
else:
    print(f"⚠️  {failed} test(s) failed")
print("=" * 50)
