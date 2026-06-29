const https = require('https');
const http = require('http');
const ThreatIntel = require('../models/ThreatIntel');
const logger = require('../config/logger');

class ThreatIntelService {
  constructor(io) {
    this.io = io; // socket.io instance for broadcasting
    this.pollInterval = 60000; // 60 seconds
    this.timer = null;
    this.latestCVEs = [];
    this.latestPulses = [];
    this.geoCache = new Map();
  }

  // ===== HTTP Fetch Utility =====
  fetchJSON(url, headers = {}, timeoutMs = 15000) {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url);
      const client = parsedUrl.protocol === 'https:' ? https : http;
      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'BlackNode-Sentinel-ThreatIntel/1.0',
          ...headers,
        },
        timeout: timeoutMs,
        rejectUnauthorized: false,
      };

      const req = client.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              reject(new Error(`JSON parse error from ${url}: ${e.message}`));
            }
          } else {
            reject(new Error(`HTTP ${res.statusCode} from ${url}: ${data.substring(0, 200)}`));
          }
        });
      });
      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error(`Timeout fetching ${url}`)); });
      req.end();
    });
  }

  // ===== NVD CVE Fetch =====
  async fetchNVD_CVEs() {
    try {
      // Use the public NVD API (no key needed, rate limited to ~5 req/30s)
      const now = new Date();
      const startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // last 24h
      const url = `https://services.nvd.nist.gov/rest/json/cves/2.0?resultsPerPage=20&pubStartDate=${startDate.toISOString().split('.')[0]}Z&pubEndDate=${now.toISOString().split('.')[0]}Z`;

      logger.info('Fetching CVEs from NVD...');
      const data = await this.fetchJSON(url);

      const cves = [];
      if (data.vulnerabilities) {
        for (const vuln of data.vulnerabilities) {
          const cve = vuln.cve;
          const severity = this.extractNVDSeverity(cve);

          const cveData = {
            id: cve.id,
            description: cve.descriptions?.[0]?.value || 'No description',
            severity,
            published: cve.published,
            lastModified: cve.lastModified,
            cvssScore: this.extractCVSSScore(cve),
            references: (cve.references || []).map(r => r.url).slice(0, 5),
            weaknesseIds: (cve.weaknesses || [])
              .flatMap(w => w.description?.map(d => d.value) || []),
          };

          cves.push(cveData);

          // Store in MongoDB (upsert)
          await ThreatIntel.findOneAndUpdate(
            { source: 'nvd', externalId: cve.id },
            {
              source: 'nvd',
              type: 'cve',
              externalId: cve.id,
              data: cveData,
              severity,
              tags: cveData.weaknesseIds,
              fetchedAt: new Date(),
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
            { upsert: true, new: true }
          );
        }
      }

      this.latestCVEs = cves;
      logger.info(`Fetched ${cves.length} CVEs from NVD`);
      return cves;
    } catch (error) {
      logger.error(`NVD CVE fetch error: ${error.message}`);
      return this.latestCVEs;
    }
  }

  extractNVDSeverity(cve) {
    try {
      const metrics = cve.metrics;
      if (metrics?.cvssMetricV31?.[0]) {
        return this.mapCVSSToSeverity(metrics.cvssMetricV31[0].cvssData.baseScore);
      }
      if (metrics?.cvssMetricV30?.[0]) {
        return this.mapCVSSToSeverity(metrics.cvssMetricV30[0].cvssData.baseScore);
      }
      if (metrics?.cvssMetricV2?.[0]) {
        return this.mapCVSSToSeverity(metrics.cvssMetricV2[0].cvssData.baseScore);
      }
      return 'info';
    } catch { return 'info'; }
  }

  extractCVSSScore(cve) {
    try {
      const metrics = cve.metrics;
      if (metrics?.cvssMetricV31?.[0]) return metrics.cvssMetricV31[0].cvssData.baseScore;
      if (metrics?.cvssMetricV30?.[0]) return metrics.cvssMetricV30[0].cvssData.baseScore;
      if (metrics?.cvssMetricV2?.[0]) return metrics.cvssMetricV2[0].cvssData.baseScore;
      return null;
    } catch { return null; }
  }

  mapCVSSToSeverity(score) {
    if (score >= 9.0) return 'critical';
    if (score >= 7.0) return 'high';
    if (score >= 4.0) return 'medium';
    if (score >= 0.1) return 'low';
    return 'info';
  }

  // ===== OTX AlienVault Pulses =====
  async fetchOTXPulses() {
    try {
      // OTX public pulse feed - no auth needed for the public feed
      const url = 'https://otx.alienvault.com/api/v1/pulses/subscribed?limit=20';
      logger.info('Fetching OTX threat pulses...');

      const data = await this.fetchJSON(url);

      const pulses = [];
      if (data.results) {
        for (const pulse of data.results) {
          const pulseData = {
            id: pulse.id,
            name: pulse.name,
            description: pulse.description || 'No description',
            created: pulse.created,
            modified: pulse.modified,
            tags: pulse.tags || [],
            malwareFamilies: (pulse.malware || []).map(m => m.malware),
            adversary: pulse.adversary || null,
            tlp: pulse.tlp || 'white',
            indicators: (pulse.indicators || []).slice(0, 10).map(i => ({
              type: i.type,
              indicator: i.indicator,
              title: i.title,
            })),
          };

          pulses.push(pulseData);

          await ThreatIntel.findOneAndUpdate(
            { source: 'otx', externalId: pulse.id },
            {
              source: 'otx',
              type: 'pulse',
              externalId: pulse.id,
              data: pulseData,
              severity: this.mapPulseSeverity(pulse),
              tags: pulse.tags || [],
              fetchedAt: new Date(),
              expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            },
            { upsert: true, new: true }
          );
        }
      }

      this.latestPulses = pulses;
      logger.info(`Fetched ${pulses.length} OTX pulses`);
      return pulses;
    } catch (error) {
      logger.error(`OTX pulse fetch error: ${error.message}`);
      return this.latestPulses;
    }
  }

  mapPulseSeverity(pulse) {
    if (pulse.adversary || (pulse.malware && pulse.malware.length > 0)) return 'high';
    if (pulse.tags && pulse.tags.length > 5) return 'medium';
    return 'low';
  }

  // ===== IP Geolocation (ip-api.com - free, no key) =====
  async getIPGeolocation(ip) {
    // Check cache
    if (this.geoCache.has(ip)) {
      const cached = this.geoCache.get(ip);
      if (Date.now() - cached.fetchedAt < 3600000) { // cache for 1 hour
        return cached.data;
      }
    }

    try {
      const url = `http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,asname,reverse,mobile,proxy,hosting,query`;
      logger.info(`Fetching geolocation for ${ip}...`);

      const data = await this.fetchJSON(url, {}, 10000);

      if (data.status === 'success') {
        const geoData = {
          ip: data.query,
          country: data.country,
          countryCode: data.countryCode,
          region: data.regionName,
          city: data.city,
          lat: data.lat,
          lon: data.lon,
          timezone: data.timezone,
          isp: data.isp,
          org: data.org,
          as: data.as,
          asName: data.asname,
          reverseDns: data.reverse,
          isMobile: data.mobile,
          isProxy: data.proxy,
          isHosting: data.hosting,
        };

        // Cache it
        this.geoCache.set(ip, { data: geoData, fetchedAt: Date.now() });

        // Store in MongoDB
        await ThreatIntel.findOneAndUpdate(
          { source: 'abuseipdb', type: 'geo_ip', externalId: ip },
          {
            source: 'abuseipdb',
            type: 'geo_ip',
            externalId: ip,
            data: geoData,
            severity: data.proxy ? 'medium' : 'info',
            tags: [
              data.proxy && 'proxy',
              data.hosting && 'hosting',
              data.mobile && 'mobile',
            ].filter(Boolean),
            fetchedAt: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
          { upsert: true, new: true }
        );

        return geoData;
      } else {
        throw new Error(data.message || 'Geolocation lookup failed');
      }
    } catch (error) {
      logger.error(`IP geolocation error for ${ip}: ${error.message}`);
      return null;
    }
  }

  // ===== Combined Feed =====
  async getCombinedFeed(limit = 50) {
    const [cves, pulses, recentIntel] = await Promise.all([
      ThreatIntel.find({ source: 'nvd' }).sort({ fetchedAt: -1 }).limit(limit / 2).lean(),
      ThreatIntel.find({ source: 'otx' }).sort({ fetchedAt: -1 }).limit(limit / 2).lean(),
      ThreatIntel.find({ fetchedAt: { $gte: new Date(Date.now() - 3600000) } })
        .sort({ fetchedAt: -1 })
        .limit(limit)
        .lean(),
    ]);

    return {
      cves,
      pulses,
      recentIntel,
      lastUpdated: new Date(),
      stats: {
        totalCVEs: cves.length,
        totalPulses: pulses.length,
        recentItems: recentIntel.length,
      },
    };
  }

  // ===== Polling =====
  startPolling() {
    logger.info('Starting threat intel poller (every 60s)...');

    // Run immediately
    this.pollAll();

    // Then every 60 seconds
    this.timer = setInterval(() => this.pollAll(), this.pollInterval);
  }

  async pollAll() {
    try {
      const [cves, pulses] = await Promise.allSettled([
        this.fetchNVD_CVEs(),
        this.fetchOTXPulses(),
      ]);

      const results = {
        cves: cves.status === 'fulfilled' ? cves.value.length : 0,
        pulses: pulses.status === 'fulfilled' ? pulses.value.length : 0,
        timestamp: new Date(),
      };

      // Broadcast update via WebSocket
      if (this.io) {
        this.io.emit('threat-intel-update', {
          type: 'feed_update',
          data: results,
          timestamp: new Date(),
        });
      }

      logger.info(`Threat intel poll complete: ${results.cves} CVEs, ${results.pulses} pulses`);
    } catch (error) {
      logger.error(`Threat intel poll error: ${error.message}`);
    }
  }

  stopPolling() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      logger.info('Threat intel poller stopped');
    }
  }
}

module.exports = ThreatIntelService;
