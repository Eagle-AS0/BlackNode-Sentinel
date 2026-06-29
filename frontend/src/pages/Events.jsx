/**
 * BlackNode Sentinel — Events
 * Security event forensics log
 */
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { events } from '../data/realData';

const severityColors = { critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#3b82f6', info: '#6b7280' };
const typeLabels = { sql_injection: 'SQL Injection', xss: 'XSS', brute_force: 'Brute Force', ddos: 'DDoS', command_injection: 'Command Injection', path_traversal: 'Path Traversal', malware: 'Malware', anomaly: 'Anomaly', port_scan: 'Port Scan' };

export default function Events() {
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const filtered = events.filter(e => {
    if (filterSeverity !== 'all' && e.severity !== filterSeverity) return false;
    if (filterType !== 'all' && e.type !== filterType) return false;
    return true;
  });

  const uniqueTypes = [...new Set(events.map(e => e.type))];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0e17' }}>
      <Navbar />
      <div style={{ flex: 1, padding: 32, overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#e2e8f0', fontFamily: 'JetBrains Mono, monospace', margin: 0 }}>
              SECURITY EVENTS
            </h1>
            <p style={{ color: '#64748b', fontSize: 13, marginTop: 8, fontFamily: 'JetBrains Mono, monospace' }}>
              {filtered.length} events {filterSeverity !== 'all' || filterType !== 'all' ? '(filtered)' : ''} — full forensic detail
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}
              style={{ padding: '8px 12px', background: '#111827', border: '1px solid #1e293b', borderRadius: 4, color: '#e2e8f0', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>
              <option value="all">ALL SEVERITIES</option>
              {['critical', 'high', 'medium', 'low', 'info'].map(s => (
                <option key={s} value={s}>{s.toUpperCase()}</option>
              ))}
            </select>
            <select value={filterType} onChange={e => setFilterType(e.target.value)}
              style={{ padding: '8px 12px', background: '#111827', border: '1px solid #1e293b', borderRadius: 4, color: '#e2e8f0', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>
              <option value="all">ALL TYPES</option>
              {uniqueTypes.map(t => (
                <option key={t} value={t}>{(typeLabels[t] || t).toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Events Table */}
        <div style={{
          background: 'linear-gradient(135deg, #111827 0%, #0f172a 100%)',
          border: '1px solid #1e293b',
          borderRadius: 8,
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1e293b' }}>
                {['ID', 'TIME', 'APPLICATION', 'TYPE', 'SEVERITY', 'SOURCE', 'METHOD', 'PATH', 'STATUS', 'ML SCORE'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 10, color: '#475569', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((evt) => (
                <React.Fragment key={evt.id}>
                  <tr style={{
                    borderBottom: '1px solid #0f172a',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    background: expandedEvent === evt.id ? '#1e293b20' : 'transparent',
                  }}
                    onClick={() => setExpandedEvent(expandedEvent === evt.id ? null : evt.id)}
                    onMouseEnter={e => e.currentTarget.style.background = '#1e293b'}
                    onMouseLeave={e => e.currentTarget.style.background = expandedEvent === evt.id ? '#1e293b20' : 'transparent'}>
                    <td style={{ padding: '10px 12px', fontSize: 11, color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>{evt.id}</td>
                    <td style={{ padding: '10px 12px', fontSize: 11, color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>{new Date(evt.timestamp).toLocaleTimeString()}</td>
                    <td style={{ padding: '10px 12px', fontSize: 11, color: '#e2e8f0', fontFamily: 'JetBrains Mono, monospace', fontWeight: 500 }}>{evt.app}</td>
                    <td style={{ padding: '10px 12px', fontSize: 10, color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase' }}>{typeLabels[evt.type]}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 4, fontSize: 10, fontFamily: 'JetBrains Mono, monospace',
                        fontWeight: 600, textTransform: 'uppercase',
                        background: severityColors[evt.severity] + '20', color: severityColors[evt.severity],
                        border: '1px solid ' + severityColors[evt.severity] + '40',
                      }}>{evt.severity}</span>
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: 11, color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace' }}>{evt.ip}</td>
                    <td style={{ padding: '10px 12px', fontSize: 11, color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>{evt.method}</td>
                    <td style={{ padding: '10px 12px', fontSize: 10, color: '#64748b', fontFamily: 'JetBrains Mono, monospace', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{evt.path}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10,
                        fontFamily: 'JetBrains Mono, monospace', color: evt.blocked ? '#10b981' : '#ef4444',
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: evt.blocked ? '#10b981' : '#ef4444' }} />
                        {evt.blocked ? 'BLOCKED' : 'ALLOWED'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 40, height: 4, background: '#1e293b', borderRadius: 2 }}>
                          <div style={{ width: evt.mlScore * 100 + '%', height: '100%', background: evt.mlScore > 0.9 ? '#ef4444' : evt.mlScore > 0.8 ? '#f97316' : '#eab308', borderRadius: 2 }} />
                        </div>
                        <span style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace' }}>{(evt.mlScore * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                  {expandedEvent === evt.id && (
                    <tr>
                      <td colSpan={10} style={{ padding: '16px 24px', background: '#0a0e17', borderBottom: '1px solid #1e293b' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                          <div>
                            <div style={{ fontSize: 10, color: '#475569', fontFamily: 'JetBrains Mono, monospace', marginBottom: 4, letterSpacing: '0.1em' }}>DESCRIPTION</div>
                            <p style={{ color: '#e2e8f0', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', margin: 0, lineHeight: 1.6 }}>{evt.description}</p>
                          </div>
                          <div>
                            <div style={{ fontSize: 10, color: '#475569', fontFamily: 'JetBrains Mono, monospace', marginBottom: 4, letterSpacing: '0.1em' }}>PAYLOAD</div>
                            <code style={{ color: '#ef4444', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', wordBreak: 'break-all', lineHeight: 1.6 }}>{evt.payload}</code>
                          </div>
                          <div>
                            <div style={{ fontSize: 10, color: '#475569', fontFamily: 'JetBrains Mono, monospace', marginBottom: 4, letterSpacing: '0.1em' }}>USER AGENT</div>
                            <code style={{ color: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1.6 }}>{evt.userAgent}</code>
                            <div style={{ fontSize: 10, color: '#475569', fontFamily: 'JetBrains Mono, monospace', marginTop: 12, letterSpacing: '0.1em' }}>ML CONFIDENCE</div>
                            <div style={{ fontSize: 24, fontWeight: 700, color: evt.mlScore > 0.9 ? '#ef4444' : '#f97316', fontFamily: 'JetBrains Mono, monospace' }}>{(evt.mlScore * 100).toFixed(1)}%</div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
