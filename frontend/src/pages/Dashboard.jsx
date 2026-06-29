/**
 * BlackNode Sentinel — Dashboard
 * Real-time threat monitoring overview
 */
import React, { useEffect, useState, useRef } from 'react';
import Navbar from '../components/Navbar';
import { events, applications, getEventStats, getAppStats } from '../data/realData';
import anime from 'animejs/lib/anime.es.js';

const severityColors = { critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#3b82f6', info: '#6b7280' };
const typeLabels = { sql_injection: 'SQL Injection', xss: 'XSS', brute_force: 'Brute Force', ddos: 'DDoS', command_injection: 'Command Injection', path_traversal: 'Path Traversal', malware: 'Malware', anomaly: 'Anomaly', port_scan: 'Port Scan' };

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, blocked: 0, blockRate: '0', severityCount: {}, typeCount: {} });
  const [appStats, setAppStats] = useState({ total: 0, active: 0, totalEvents: 0, totalBlocked: 0, avgUptime: '0' });
  const [recentEvents, setRecentEvents] = useState([]);
  const cardsRef = useRef([]);

  useEffect(() => {
    const s = getEventStats();
    const a = getAppStats();
    setStats(s);
    setAppStats(a);
    setRecentEvents(events.slice(0, 8));

    anime({
      targets: cardsRef.current,
      translateY: [30, 0],
      opacity: [0, 1],
      easing: 'easeOutExpo',
      duration: 800,
      delay: anime.stagger(100),
    });
  }, []);

  const statCards = [
    { label: 'TOTAL EVENTS', value: stats.total, color: '#3b82f6', sub: 'Last 24 hours' },
    { label: 'BLOCKED', value: stats.blocked, color: '#10b981', sub: stats.blockRate + '% block rate' },
    { label: 'CRITICAL', value: stats.severityCount.critical || 0, color: '#ef4444', sub: 'Require immediate action' },
    { label: 'ACTIVE APPS', value: appStats.active, color: '#8b5cf6', sub: 'Monitoring ' + appStats.total + ' applications' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0e17' }}>
      <Navbar />
      <div style={{ flex: 1, padding: '32px', overflow: 'auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#e2e8f0', fontFamily: 'JetBrains Mono, monospace', margin: 0 }}>
            SECURITY OPERATIONS CENTER
          </h1>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 8, fontFamily: 'JetBrains Mono, monospace' }}>
            Real-time threat monitoring and analysis
          </p>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
          {statCards.map((card, i) => (
            <div key={i} ref={el => cardsRef.current[i] = el} style={{
              background: 'linear-gradient(135deg, #111827 0%, #0f172a 100%)',
              border: '1px solid #1e293b',
              borderRadius: 8,
              padding: 24,
              position: 'relative',
              overflow: 'hidden',
              opacity: 0,
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: card.color }} />
              <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', marginBottom: 8 }}>
                {card.label}
              </div>
              <div style={{ fontSize: 36, fontWeight: 700, color: card.color, fontFamily: 'JetBrains Mono, monospace' }}>
                {card.value}
              </div>
              <div style={{ fontSize: 11, color: '#475569', marginTop: 4, fontFamily: 'JetBrains Mono, monospace' }}>
                {card.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
          {/* Severity Distribution */}
          <div style={{
            background: 'linear-gradient(135deg, #111827 0%, #0f172a 100%)',
            border: '1px solid #1e293b',
            borderRadius: 8,
            padding: 24,
          }}>
            <h3 style={{ fontSize: 13, color: '#64748b', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', marginBottom: 20, marginTop: 0 }}>
              SEVERITY DISTRIBUTION
            </h3>
            {Object.entries(stats.severityCount).map(([sev, count]) => (
              <div key={sev} style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: severityColors[sev], marginRight: 12, flexShrink: 0 }} />
                <span style={{ color: '#94a3b8', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', width: 80, textTransform: 'uppercase' }}>{sev}</span>
                <div style={{ flex: 1, height: 8, background: '#1e293b', borderRadius: 4, marginRight: 12 }}>
                  <div style={{ height: '100%', width: (count / stats.total * 100) + '%', background: severityColors[sev], borderRadius: 4, transition: 'width 0.6s ease' }} />
                </div>
                <span style={{ color: '#e2e8f0', fontSize: 13, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, minWidth: 30, textAlign: 'right' }}>{count}</span>
              </div>
            ))}
          </div>

          {/* Attack Vectors */}
          <div style={{
            background: 'linear-gradient(135deg, #111827 0%, #0f172a 100%)',
            border: '1px solid #1e293b',
            borderRadius: 8,
            padding: 24,
          }}>
            <h3 style={{ fontSize: 13, color: '#64748b', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', marginBottom: 20, marginTop: 0 }}>
              ATTACK VECTORS
            </h3>
            {Object.entries(stats.typeCount).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
              <div key={type} style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ color: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', width: 140, textTransform: 'uppercase' }}>
                  {typeLabels[type] || type}
                </span>
                <div style={{ flex: 1, height: 8, background: '#1e293b', borderRadius: 4, marginRight: 12 }}>
                  <div style={{ height: '100%', width: (count / Math.max(...Object.values(stats.typeCount)) * 100) + '%', background: '#3b82f6', borderRadius: 4, transition: 'width 0.6s ease' }} />
                </div>
                <span style={{ color: '#e2e8f0', fontSize: 13, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, minWidth: 30, textAlign: 'right' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Events Table */}
        <div style={{
          background: 'linear-gradient(135deg, #111827 0%, #0f172a 100%)',
          border: '1px solid #1e293b',
          borderRadius: 8,
          overflow: 'hidden',
        }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 13, color: '#64748b', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', margin: 0 }}>
              RECENT SECURITY EVENTS
            </h3>
            <span style={{ fontSize: 11, color: '#3b82f6', fontFamily: 'JetBrains Mono, monospace', cursor: 'pointer' }}>
              VIEW ALL
            </span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1e293b' }}>
                {['TIME', 'APPLICATION', 'TYPE', 'SEVERITY', 'SOURCE IP', 'STATUS'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, color: '#475569', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentEvents.map((evt, i) => (
                <tr key={evt.id} style={{ borderBottom: '1px solid #0f172a', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#1e293b'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '10px 16px', fontSize: 12, color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>
                    {new Date(evt.timestamp).toLocaleTimeString()}
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: 12, color: '#e2e8f0', fontFamily: 'JetBrains Mono, monospace', fontWeight: 500 }}>
                    {evt.app}
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: 11, color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase' }}>
                    {typeLabels[evt.type] || evt.type}
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: 10,
                      fontFamily: 'JetBrains Mono, monospace',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      background: severityColors[evt.severity] + '20',
                      color: severityColors[evt.severity],
                      border: '1px solid ' + severityColors[evt.severity] + '40',
                    }}>{evt.severity}</span>
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: 12, color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace' }}>
                    {evt.ip}
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 11,
                      fontFamily: 'JetBrains Mono, monospace',
                      color: evt.blocked ? '#10b981' : '#ef4444',
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: evt.blocked ? '#10b981' : '#ef4444' }} />
                      {evt.blocked ? 'BLOCKED' : 'ALLOWED'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
