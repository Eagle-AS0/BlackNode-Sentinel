# BlackNode Agent

Drop-in Express middleware for **Runtime Application Protection**. Inspects every HTTP request for threats and sends data to BlackNode Sentinel for real-time monitoring.

## What It Detects

| Threat | Detection Method | Auto-Block |
|--------|-----------------|------------|
| SQL Injection | Pattern matching on params, body, URL | ✅ |
| XSS | Script tags, event handlers, JavaScript URIs | ✅ |
| Path Traversal | `../`, `%2e%2e`, `/etc/passwd` | ✅ |
| Command Injection | Shell commands, pipe operators | ✅ |
| Brute Force | IP request frequency tracking | ✅ |
| Port Scan | Unique path tracking per IP | ✅ |
| DDoS | Request rate monitoring | ✅ |
| Suspicious User-Agents | Known scanner tools | ✅ |

## Quick Start

```bash
npm install blacknode-agent
```

```javascript
const express = require('express');
const BlackNodeAgent = require('blacknode-agent');

const app = express();

const agent = new BlackNodeAgent({
  serverUrl: 'https://your-sentinel-server.com/api',
  agentKey:  'your-agent-key-from-dashboard',
  appUrl:    'https://your-app.com',
});

app.use(agent.middleware());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(3000);
```

## Configuration

| Option | Default | Description |
|--------|---------|-------------|
| `serverUrl` | `http://localhost:5004/api` | BlackNode Sentinel API URL |
| `agentKey` | — | Your app's monitoring key (from dashboard) |
| `appUrl` | `''` | Your app's public URL |
| `timeout` | `5000` | Timeout for sending events (ms) |
| `batchSize` | `20` | Batch size before flushing to server |
| `flushInterval` | `10000` | Max time between flushes (ms) |
| `blockThreshold` | `0.7` | ML score threshold for auto-blocking |
| `enabled` | `true` | Enable/disable monitoring |

## Environment Variables

```bash
BLACKNODE_SERVER_URL=https://your-sentinel-server.com/api
BLACKNODE_AGENT_KEY=your-agent-key
```

## Non-Express Usage

```javascript
const agent = new BlackNodeAgent({ serverUrl, agentKey });

// For any framework — manually send requests for analysis
const result = agent.analyze({
  ip: req.ip,
  method: req.method,
  url: req.url,
  userAgent: req.headers['user-agent'],
  body: req.body,
  query: req.query,
});

if (result && result.score > 0.7) {
  return res.status(403).send('Blocked');
}
```

## How It Works

1. Every HTTP request passes through the middleware
2. Request data is analyzed locally for instant threat detection
3. High-scoring threats (≥0.7) are auto-blocked (403)
4. All request data is batched and sent to BlackNode Sentinel server
5. BlackNode stores events, updates dashboard in real-time
6. Dashboard shows live threat stats, severity breakdown, recent events

## License

MIT
