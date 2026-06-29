const dns = require('dns').promises;
const tls = require('tls');
const http = require('http');
const https = require('https');
const { URL } = require('url');

class NetworkMonitorService {
  async dnsLookup(domain) {
    try {
      const [aRecords, aaaaRecords, mxRecords, nsRecords, txtRecords] = await Promise.all([
        dns.resolve4(domain).catch(() => []),
        dns.resolve6(domain).catch(() => []),
        dns.resolveMx(domain).catch(() => []),
        dns.resolveNs(domain).catch(() => []),
        dns.resolveTxt(domain).catch(() => []),
      ]);
      return { domain, a: aRecords, aaaa: aaaaRecords, mx: mxRecords, ns: nsRecords, txt: txtRecords.map(t => t.join('')).slice(0, 5), timestamp: new Date().toISOString() };
    } catch (err) {
      return { domain, error: err.message, timestamp: new Date().toISOString() };
    }
  }

  async sslCheck(domain) {
    return new Promise((resolve) => {
      const options = { host: domain, port: 443, servername: domain, rejectUnauthorized: false, timeout: 10000 };
      try {
        const socket = tls.connect(options, () => {
          const cert = socket.getPeerCertificate();
          socket.end();
          if (!cert || !cert.subject) {
            resolve({ domain, error: 'No certificate', timestamp: new Date().toISOString() });
            return;
          }
          const validFrom = new Date(cert.valid_from);
          const validTo = new Date(cert.valid_to);
          const now = new Date();
          const daysUntilExpiry = Math.floor((validTo - now) / (1000 * 60 * 60 * 24));
          resolve({
            domain, subject: cert.subject?.CN || '', issuer: cert.issuer?.CN || '',
            validFrom: cert.valid_from, validTo: cert.valid_to,
            daysUntilExpiry, isExpired: now > validTo, isValid: now >= validFrom && now <= validTo,
            serialNumber: cert.serialNumber?.substring(0, 16) || '',
            fingerprint: cert.fingerprint256 || '',
            protocol: socket.getProtocol() || 'unknown',
            timestamp: new Date().toISOString(),
          });
        });
        socket.on('error', (err) => resolve({ domain, error: err.message, timestamp: new Date().toISOString() }));
        socket.on('timeout', () => { socket.destroy(); resolve({ domain, error: 'Connection timeout', timestamp: new Date().toISOString() }); });
      } catch (err) {
        resolve({ domain, error: err.message, timestamp: new Date().toISOString() });
      }
    });
  }

  async httpCheck(url, timeout = 10000) {
    return new Promise((resolve) => {
      const start = Date.now();
      const client = url.startsWith('https') ? https : http;
      const req = client.get(url, { timeout }, (res) => {
        const duration = Date.now() - start;
        let data = '';
        res.on('data', chunk => data += chunk.toString().substring(0, 500));
        res.on('end', () => {
          const server = res.headers['server'] || '';
          const poweredBy = res.headers['x-powered-by'] || '';
          const securityHeaders = {
            hsts: !!res.headers['strict-transport-security'],
            csp: !!res.headers['content-security-policy'],
            xFrameOptions: !!res.headers['x-frame-options'],
            xContentTypeOptions: !!res.headers['x-content-type-options'],
            xXssProtection: !!res.headers['x-xss-protection'],
          };
          const secScore = Object.values(securityHeaders).filter(Boolean).length;
          resolve({ url: url, status: res.statusCode, responseTime: duration, server, poweredBy, securityHeaders, securityScore: secScore + '/5', contentType: res.headers['content-type'] || '', timestamp: new Date().toISOString() });
        });
      });
      req.on('error', (err) => resolve({ url: url, error: err.message, timestamp: new Date().toISOString() }));
      req.on('timeout', () => { req.destroy(); resolve({ url: url, error: 'Timeout', timestamp: new Date().toISOString() }); });
    });
  }

  async portScan(host, ports = [21,22,25,53,80,443,3306,5432,8080,8443]) {
    const net = require('net');
    const results = [];
    const scanPort = (port) => new Promise((resolve) => {
      const socket = new net.Socket();
      socket.setTimeout(2000);
      socket.on('connect', () => { socket.destroy(); resolve({ port, state: 'open' }); });
      socket.on('timeout', () => { socket.destroy(); resolve({ port, state: 'filtered' }); });
      socket.on('error', (err) => { socket.destroy(); resolve({ port, state: err.code === 'ECONNREFUSED' ? 'closed' : 'filtered' }); });
      socket.connect(port, host);
    });
    const portNames = { 21:'FTP',22:'SSH',25:'SMTP',53:'DNS',80:'HTTP',443:'HTTPS',3306:'MySQL',5432:'PostgreSQL',8080:'HTTP-Alt',8443:'HTTPS-Alt' };
    for (const port of ports) {
      const r = await scanPort(port);
      results.push({ ...r, service: portNames[port] || 'unknown' });
    }
    return { host, ports: results, openPorts: results.filter(r => r.state === 'open').length, timestamp: new Date().toISOString() };
  }

  async fullScan(domain) {
    const url = domain.startsWith('http') ? domain : `https://${domain}`;
    const hostname = new URL(url).hostname;
    const [dns, ssl, http, ports] = await Promise.all([
      this.dnsLookup(hostname).catch(e => ({ error: e.message })),
      this.sslCheck(hostname).catch(e => ({ error: e.message })),
      this.httpCheck(url).catch(e => ({ error: e.message })),
      this.portScan(hostname).catch(e => ({ error: e.message })),
    ]);
    return { domain: hostname, dns, ssl, http, ports, timestamp: new Date().toISOString() };
  }
}

module.exports = new NetworkMonitorService();
