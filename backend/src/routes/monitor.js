const express = require('express');
const router = express.Router();
const SecurityEvent = require('../models/SecurityEvent');
const Application = require('../models/Application');
const logger = require('../config/logger');

// POST /api/monitor/ingest
// External apps send their traffic logs here for real-time analysis
// This is the MAIN endpoint — your apps POST their HTTP request data here
// and BlackNode analyzes it for threats in real-time.
router.post('/ingest', async (req, res) => {
  try {
    const { agentKey, request } = req.body;

    if (!agentKey || !request) {
      return res.status(400).json({ success: false, message: 'agentKey and request are required' });
    }

    // Find the application by its monitoring key
    const application = await Application.findOne({ agentKey });
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found with this key' });
    }

    // Analyze the request for threats
    const threats = analyzeRequest(request);

    const events = [];
    for (const threat of threats) {
      const event = await SecurityEvent.create({
        organization: application.organization,
        application: application._id,
        eventType: threat.eventType,
        severity: threat.severity,
        source: {
          ip: request.ip || request.remoteAddress || 'unknown',
          method: request.method || 'GET',
          path: request.path || request.url || '/',
          userAgent: request.userAgent || request.headers?.['user-agent'] || '',
        },
        payload: {
          parameter: threat.parameter,
          value: threat.value ? String(threat.value).substring(0, 500) : '',
        },
        blocked: threat.severity === 'critical' || threat.severity === 'high',
        tags: threat.tags || [],
        description: threat.description,
        mlScore: threat.mlScore || 0,
      });
      events.push(event);
    }

    res.status(200).json({
      success: true,
      message: `Analyzed request — ${events.length} events created`,
      data: { eventsCreated: events.length, threats: events.map(e => ({ type: e.eventType, severity: e.severity })) },
    });
  } catch (error) {
    logger.error(`Monitor ingest error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/monitor/batch
// Bulk ingest — send multiple requests at once
router.post('/batch', async (req, res) => {
  try {
    const { agentKey, requests } = req.body;

    if (!agentKey || !Array.isArray(requests)) {
      return res.status(400).json({ success: false, message: 'agentKey and requests[] are required' });
    }

    const application = await Application.findOne({ agentKey });
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    let totalEvents = 0;
    for (const request of requests) {
      const threats = analyzeRequest(request);
      for (const threat of threats) {
        await SecurityEvent.create({
          organization: application.organization,
          application: application._id,
          eventType: threat.eventType,
          severity: threat.severity,
          source: {
            ip: request.ip || 'unknown',
            method: request.method || 'GET',
            path: request.path || '/',
            userAgent: request.userAgent || '',
          },
          payload: { parameter: threat.parameter, value: String(threat.value || '').substring(0, 500) },
          blocked: threat.severity === 'critical' || threat.severity === 'high',
          tags: threat.tags || [],
          description: threat.description,
          mlScore: threat.mlScore || 0,
        });
        totalEvents++;
      }
    }

    res.status(200).json({ success: true, message: `Processed ${requests.length} requests — ${totalEvents} events` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/monitor/health/:appKey
// Check if a monitored app is alive
router.get('/health/:appKey', async (req, res) => {
  try {
    const application = await Application.findOne({ agentKey: req.params.appKey });
    if (!application) return res.status(404).json({ success: false });

    const recentEvents = await SecurityEvent.countDocuments({
      application: application._id,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    res.json({ success: true, data: { appName: application.name, eventsLast24h: recentEvents } });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// ===== REAL-TIME THREAT ANALYSIS ENGINE =====
function analyzeRequest(request) {
  const threats = [];
  const input = JSON.stringify(request).toLowerCase();
  const headers = request.headers || {};
  const body = typeof request.body === 'string' ? request.body : JSON.stringify(request.body || '');
  const url = request.url || request.path || '';
  const query = request.query || {};
  const cookies = request.cookies || {};

  // 1. SQL Injection Detection
  const sqlPatterns = [
    { re: /('|")\s*(or|and)\s+['"]?\d+['"]?\s*=\s*['"]?\d+/i, desc: 'SQL auth bypass attempt' },
    { re: /union\s+(all\s+)?select/i, desc: 'UNION SELECT injection' },
    { re: /;\s*(drop|alter|create|delete|truncate)\s+/i, desc: 'SQL statement injection' },
    { re: /sleep\s*\(\s*\d+\s*\)/i, desc: 'Time-based blind SQLi' },
    { re: /waitfor\s+delay/i, desc: 'MSSQL time-based injection' },
    { re: /--\s*$|\/\*.*\*\//i, desc: 'SQL comment injection' },
    { re: /information_schema|sysobjects|syscolumns/i, desc: 'SQL schema enumeration' },
    { re: /load_file\s*\(|into\s+outfile|into\s+dumpfile/i, desc: 'MySQL file operations' },
  ];

  for (const inputStr of [body, url, JSON.stringify(query), JSON.stringify(cookies)]) {
    for (const pattern of sqlPatterns) {
      if (pattern.re.test(inputStr)) {
        threats.push({
          eventType: 'sql_injection',
          severity: 'critical',
          parameter: 'input',
          value: inputStr.substring(0, 200),
          description: `SQL Injection: ${pattern.desc}`,
          tags: ['sql-injection', 'attack'],
          mlScore: 0.9,
        });
        break; // One SQLi per input
      }
    }
  }

  // 2. XSS Detection
  const xssPatterns = [
    { re: /<script[\s>]/i, desc: 'Script tag injection' },
    { re: /on(error|load|click|mouse)\s*=/i, desc: 'Event handler injection' },
    { re: /javascript\s*:/i, desc: 'JavaScript URI injection' },
    { re: /<img[^>]+src\s*=\s*["']?\s*[^"'\s>]*\s*["']?[^>]*onerror/i, desc: 'Image onerror XSS' },
    { re: /document\.(cookie|location|write)/i, desc: 'DOM manipulation attempt' },
    { re: /eval\s*\(/i, desc: 'eval() injection attempt' },
    { re: /alert\s*\(\s*['"]?\d*['"]?\s*\)/i, desc: 'alert() XSS payload' },
  ];

  for (const inputStr of [body, url, JSON.stringify(query)]) {
    for (const pattern of xssPatterns) {
      if (pattern.re.test(inputStr)) {
        threats.push({
          eventType: 'xss',
          severity: 'high',
          parameter: 'input',
          value: inputStr.substring(0, 200),
          description: `XSS: ${pattern.desc}`,
          tags: ['xss', 'attack'],
          mlScore: 0.8,
        });
        break;
      }
    }
  }

  // 3. Path Traversal Detection
  const traversalPatterns = [
    { re: /\.\.\//g, desc: 'Directory traversal' },
    { re: /\.\.\\/, desc: 'Windows path traversal' },
    { re: /%2e%2e%2f|%2e%2e%5c/i, desc: 'URL-encoded traversal' },
    { re: /\/etc\/(passwd|shadow|hosts)/i, desc: 'Linux system file access' },
    { re: /\/proc\/self/i, desc: 'Linux /proc filesystem access' },
    { re: /win\.ini|boot\.ini|system\.ini/i, desc: 'Windows system file access' },
  ];

  for (const inputStr of [body, url, JSON.stringify(query)]) {
    for (const pattern of traversalPatterns) {
      if (pattern.re.test(inputStr)) {
        threats.push({
          eventType: 'path_traversal',
          severity: 'high',
          parameter: 'path',
          value: inputStr.substring(0, 200),
          description: `Path Traversal: ${pattern.desc}`,
          tags: ['path-traversal', 'attack'],
          mlScore: 0.75,
        });
        break;
      }
    }
  }

  // 4. Command Injection Detection
  const cmdiPatterns = [
    { re: /[;|&`]\s*(cat|ls|id|whoami|wget|curl|bash|sh|nc|ncat|python|perl)\b/i, desc: 'Shell command injection' },
    { re: /\$\([^)]+\)/, desc: 'Command substitution' },
    { re: /\|\s*(cat|ls|id|whoami)\b/i, desc: 'Pipe command injection' },
    { re: />\s*\/dev\/null\s*2>&1/i, desc: 'Output redirection (recon)' },
  ];

  for (const inputStr of [body, url, JSON.stringify(query)]) {
    for (const pattern of cmdiPatterns) {
      if (pattern.re.test(inputStr)) {
        threats.push({
          eventType: 'suspicious',
          severity: 'critical',
          parameter: 'input',
          value: inputStr.substring(0, 200),
          description: `Command Injection: ${pattern.desc}`,
          tags: ['command-injection', 'attack'],
          mlScore: 0.85,
        });
        break;
      }
    }
  }

  // 5. Brute Force Detection (high frequency from same IP)
  if (request._bruteForceCount && request._bruteForceCount > 10) {
    threats.push({
      eventType: 'brute_force',
      severity: 'high',
      parameter: 'request_frequency',
      value: `${request._bruteForceCount} requests from ${request.ip}`,
      description: `Brute Force: ${request._bruteForceCount} rapid requests from same IP`,
      tags: ['brute-force'],
      mlScore: 0.7,
    });
  }

  // 6. Suspicious User-Agent
  const ua = (request.userAgent || headers['user-agent'] || '').toLowerCase();
  const suspiciousUAs = [
    'nikto', 'sqlmap', 'nmap', 'masscan', 'dirbuster', 'gobuster',
    'hydra', 'burp', 'owasp', 'zap', 'metasploit', 'havij',
    'acunetix', 'netsparker', 'qualys', 'nessus',
  ];
  for (const tool of suspiciousUAs) {
    if (ua.includes(tool)) {
      threats.push({
        eventType: 'suspicious',
        severity: 'critical',
        parameter: 'user-agent',
        value: request.userAgent || headers['user-agent'],
        description: `Scanner Tool Detected: ${tool.toUpperCase()}`,
        tags: ['scanner', 'reconnaissance'],
        mlScore: 0.95,
      });
      break;
    }
  }

  // 7. API Key / Token exposure
  const secrets = [
    /api[_-]?key\s*[:=]\s*["']?[a-zA-Z0-9]{16,}/i,
    /password\s*[:=]\s*["']?[^\s"']{6,}/i,
    /token\s*[:=]\s*["']?[a-zA-Z0-9]{16,}/i,
    /secret\s*[:=]\s*["']?[a-zA-Z0-9]{16,}/i,
    /aws[_-]?(access|secret)[_-]?key/i,
    /BEGIN\s+(RSA|DSA|EC)?\s*PRIVATE\s+KEY/i,
  ];

  for (const inputStr of [body, JSON.stringify(query)]) {
    for (const pattern of secrets) {
      if (pattern.test(inputStr)) {
        threats.push({
          eventType: 'suspicious',
          severity: 'high',
          parameter: 'request_body',
          value: '[REDACTED SECRET]',
          description: 'Potential secret/credential exposure in request',
          tags: ['data-leak', 'credentials'],
          mlScore: 0.6,
        });
        break;
      }
    }
  }

  // 8. DDOS Detection (high request rate)
  if (request._requestRate && request._requestRate > 100) {
    threats.push({
      eventType: 'ddos',
      severity: 'critical',
      parameter: 'request_rate',
      value: `${request._requestRate} req/s`,
      description: `DDoS: Abnormally high request rate (${request._requestRate} req/s)`,
      tags: ['ddos'],
      mlScore: 0.9,
    });
  }

  // 9. Port Scan Detection (multiple different paths rapidly)
  if (request._uniquePaths && request._uniquePaths > 50) {
    threats.push({
      eventType: 'port_scan',
      severity: 'medium',
      parameter: 'path_diversity',
      value: `${request._uniquePaths} unique paths`,
      description: `Path Enumeration: ${request._uniquePaths} unique paths accessed rapidly`,
      tags: ['port-scan', 'reconnaissance'],
      mlScore: 0.5,
    });
  }

  // 10. No threats found — log as normal traffic (low severity)
  if (threats.length === 0) {
    // Only log occasionally to avoid flooding
    if (Math.random() < 0.05) { // 5% sampling
      threats.push({
        eventType: 'anomaly',
        severity: 'info',
        parameter: 'traffic',
        value: `${request.method || 'GET'} ${url}`,
        description: `Normal traffic: ${request.method || 'GET'} ${url}`,
        tags: ['normal'],
        mlScore: 0,
      });
    }
  }

  return threats;
}

module.exports = router;
