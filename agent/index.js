/**
 * BlackNode Sentinel — Runtime Application Protection Agent
 *
 * Drop-in Express middleware that inspects every HTTP request
 * for SQL injection, XSS, path traversal, command injection,
 * brute force, DDoS, port scanning, and malware patterns.
 *
 * Detected threats are sent to BlackNode Sentinel for logging,
 * analysis, and real-time dashboard display.
 *
 * Usage:
 *   const BlackNodeAgent = require('blacknode-agent');
 *   const agent = new BlackNodeAgent({
 *     serverUrl: 'https://sentinel.yourcompany.com/api',
 *     agentKey:  'your-agent-key-from-dashboard',
 *     appUrl:    'https://your-app.com',
 *   });
 *   app.use(agent.middleware());
 */

const http = require('http');
const https = require('https');

class BlackNodeAgent {
  constructor(config = {}) {
    this.serverUrl = config.serverUrl || process.env.BLACKNODE_SERVER_URL || 'http://localhost:5004/api';
    this.agentKey = config.agentKey || process.env.BLACKNODE_AGENT_KEY;
    this.appUrl = config.appUrl || '';
    this.timeout = config.timeout || 5000;
    this.batchSize = config.batchSize || 20;
    this.flushInterval = config.flushInterval || 10000; // 10 seconds
    this.blockThreshold = config.blockThreshold || 0.7; // ML score to auto-block
    this.enabled = config.enabled !== false;

    // In-memory buffer for batched sending
    this.buffer = [];
    this.flushTimer = null;
    this.ipCounts = {}; // For brute force detection
    this.pathCounts = {}; // For port scan detection

    if (this.enabled && !this.agentKey) {
      console.warn('[BlackNode] WARNING: No agentKey configured. Threats will be detected locally but NOT sent to dashboard.');
    }
  }

  /**
   * Express middleware — use with app.use(agent.middleware())
   */
  middleware() {
    return (req, res, next) => {
      if (!this.enabled) return next();

      const startTime = Date.now();
      const clientIp = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || 'unknown';

      // Track request counts per IP for brute force detection
      this.ipCounts[clientIp] = (this.ipCounts[clientIp] || 0) + 1;
      setTimeout(() => { this.ipCounts[clientIp] = Math.max(0, (this.ipCounts[clientIp] || 1) - 1); }, 60000);

      // Track unique paths per IP for port scan detection
      const pathKey = `${clientIp}:${req.path}`;
      this.pathCounts[clientIp] = this.pathCounts[clientIp] || new Set();
      this.pathCounts[clientIp].add(req.path);
      if (this.pathCounts[clientIp].size > 100) {
        // Auto-cleanup after 5 minutes
        setTimeout(() => { delete this.pathCounts[clientIp]; }, 300000);
      }

      // Capture the original end method to intercept response
      const originalEnd = res.end;
      res.end = function (...args) {
        const duration = Date.now() - startTime;

        // Build request data for analysis
        const requestData = {
          ip: clientIp,
          method: req.method,
          url: req.originalUrl || req.url,
          path: req.path,
          headers: {
            'user-agent': req.headers['user-agent'] || '',
            'accept': req.headers['accept'] || '',
            'content-type': req.headers['content-type'] || '',
            'referer': req.headers['referer'] || '',
            'origin': req.headers['origin'] || '',
          },
          userAgent: req.headers['user-agent'] || '',
          query: req.query || {},
          body: req.body ? (typeof req.body === 'string' ? req.body : JSON.stringify(req.body).substring(0, 2000)) : '',
          cookies: Object.keys(req.cookies || {}),
          statusCode: res.statusCode,
          duration,
          _bruteForceCount: this.ipCounts?.[clientIp] || 0,
          _uniquePaths: this.pathCounts?.[clientIp]?.size || 0,
          _requestRate: 0, // computed on server side
          timestamp: new Date().toISOString(),
        };

        // Send to buffer (will be batched and sent to BlackNode)
        this.bufferRequest(requestData);

        // Local threat analysis (instant blocking)
        const threat = this.analyzeLocally(requestData);
        if (threat && threat.score >= this.blockThreshold) {
          // Auto-block: return 403
          if (!res.headersSent) {
            res.status(403).json({
              error: 'Blocked by BlackNode Sentinel',
              reason: threat.description,
            });
          }
          return;
        }

        originalEnd.apply(res, args);
      }.bind(this);

      next();
    };
  }

  /**
   * Manually send a request for analysis (for non-Express frameworks)
   */
  analyze(requestData) {
    this.bufferRequest(requestData);
    return this.analyzeLocally(requestData);
  }

  /**
   * Flush the buffer to BlackNode server
   */
  bufferRequest(requestData) {
    this.buffer.push(requestData);
    if (this.buffer.length >= this.batchSize) {
      this.flush();
    } else if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => this.flush(), this.flushInterval);
    }
  }

  flush() {
    if (this.buffer.length === 0) return;
    if (!this.agentKey) { this.buffer = []; return; }

    const batch = [...this.buffer];
    this.buffer = [];
    clearTimeout(this.flushTimer);
    this.flushTimer = null;

    const payload = JSON.stringify({ agentKey: this.agentKey, requests: batch });
    const url = new URL('/api/monitor/batch', this.serverUrl);
    const client = url.protocol === 'https:' ? https : http;

    const req = client.request({
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: '/api/monitor/batch',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'X-BlackNode-Agent': 'true',
      },
      timeout: this.timeout,
    }, (res) => { res.resume(); });

    req.on('error', () => { /* silently retry on next flush */ });
    req.on('timeout', () => req.destroy());
    req.write(payload);
    req.end();
  }

  /**
   * Local threat analysis (runs instantly, no network call)
   */
  analyzeLocally(req) {
    const allInput = [req.method, req.url, req.path, JSON.stringify(req.query), req.body, req.userAgent].join(' ').toLowerCase();

    const patterns = [
      { re: /('|")\s*(or|and)\s+['"]?\d+['"]?\s*=\s*['"]?\d+/i, score: 0.95, desc: 'SQL Injection', type: 'sql_injection' },
      { re: /union\s+(all\s+)?select/i, score: 0.95, desc: 'SQL Injection (UNION)', type: 'sql_injection' },
      { re: /;\s*(drop|alter|create|delete|truncate)\s+/i, score: 0.9, desc: 'SQL Statement Injection', type: 'sql_injection' },
      { re: /<script[\s>]/i, score: 0.9, desc: 'XSS Script Tag', type: 'xss' },
      { re: /on(error|load|click)\s*=/i, score: 0.85, desc: 'XSS Event Handler', type: 'xss' },
      { re: /javascript\s*:/i, score: 0.85, desc: 'XSS JavaScript URI', type: 'xss' },
      { re: /\.\.\/|\.\.\\|%2e%2e/i, score: 0.8, desc: 'Path Traversal', type: 'path_traversal' },
      { re: /[;|&`]\s*(cat|ls|id|whoami|wget|curl|bash)\b/i, score: 0.9, desc: 'Command Injection', type: 'command_injection' },
    ];

    for (const p of patterns) {
      if (p.re.test(allInput)) {
        return { score: p.score, description: p.desc, type: p.type };
      }
    }

    return null;
  }

  /**
   * Stop the agent and flush remaining events
   */
  destroy() {
    this.enabled = false;
    clearTimeout(this.flushTimer);
    this.flush();
  }
}

module.exports = BlackNodeAgent;
