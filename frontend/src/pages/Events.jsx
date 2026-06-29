/**
 * BlackNode Sentinel — Events
 * Security event log with forensic details
 */
import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar';

const Events = () => {
  const { apiClient } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ severity: '', eventType: '', blocked: '' });
  const [expandedEvent, setExpandedEvent] = useState(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.severity) params.append('severity', filters.severity);
      if (filters.eventType) params.append('eventType', filters.eventType);
      if (filters.blocked) params.append('blocked', filters.blocked);
      const res = await apiClient.get(`/events?${params.toString()}`);
      setEvents(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [apiClient, filters]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const formatTime = (d) => {
    const date = new Date(d);
    return date.toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getRowClass = (sev) => {
    if (sev === 'critical') return 'row-critical';
    if (sev === 'high') return 'row-high';
    if (sev === 'medium') return 'row-medium';
    return '';
  };

  return (
    <>
      <Navbar />
      <div className="main-content">
        <div className="page-header">
          <h1>
            <span style={{
              width: 28, height: 28, borderRadius: 6,
              background: 'rgba(255, 23, 68, 0.1)',
              border: '1px solid rgba(255, 23, 68, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: 'var(--accent-red)',
            }}>E</span>
            Security Event Log
          </h1>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-muted)' }}>
            {events.length} events recorded
          </div>
        </div>

        {/* Filters */}
        <div style={{
          display: 'flex', gap: 10, marginBottom: 20, padding: '12px 16px',
          background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: 6,
        }}>
          <select className="input-field" style={{ width: 160 }} value={filters.severity}
            onChange={(e) => setFilters({ ...filters, severity: e.target.value })}>
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="info">Info</option>
          </select>
          <select className="input-field" style={{ width: 180 }} value={filters.eventType}
            onChange={(e) => setFilters({ ...filters, eventType: e.target.value })}>
            <option value="">All Types</option>
            <option value="sql_injection">SQL Injection</option>
            <option value="xss">XSS</option>
            <option value="brute_force">Brute Force</option>
            <option value="path_traversal">Path Traversal</option>
            <option value="command_injection">Command Injection</option>
            <option value="ddos">DDoS</option>
            <option value="malware">Malware</option>
            <option value="anomaly">Anomaly</option>
            <option value="port_scan">Port Scan</option>
          </select>
          <select className="input-field" style={{ width: 150 }} value={filters.blocked}
            onChange={(e) => setFilters({ ...filters, blocked: e.target.value })}>
            <option value="">All Status</option>
            <option value="true">Blocked</option>
            <option value="false">Not Blocked</option>
          </select>
        </div>

        {/* Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <div className="spinner" />
            </div>
          ) : events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--text-muted)' }}>
                No events match current filters
              </div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Severity</th>
                    <th>Type</th>
                    <th>Source IP</th>
                    <th>Method</th>
                    <th>Path</th>
                    <th>Application</th>
                    <th>Blocked</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event, i) => (
                    <React.Fragment key={event._id || i}>
                      <tr className={getRowClass(event.severity)}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setExpandedEvent(expandedEvent === event._id ? null : event._id)}>
                        <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {formatTime(event.createdAt)}
                        </td>
                        <td>
                          <span className={`badge badge-${event.severity}`}>{event.severity}</span>
                        </td>
                        <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                          {event.eventType?.replace(/_/g, ' ')}
                        </td>
                        <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
                          {event.source?.ip || 'N/A'}
                        </td>
                        <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-secondary)' }}>
                          {event.source?.method || 'N/A'}
                        </td>
                        <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {event.source?.path || 'N/A'}
                        </td>
                        <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-secondary)' }}>
                          {event.application?.name || 'N/A'}
                        </td>
                        <td>
                          {event.blocked ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                              <div className="status-dot online" />
                              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--accent-green)' }}>BLOCKED</span>
                            </span>
                          ) : (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                              <div className="status-dot warning" />
                              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--accent-orange)' }}>LOGGED</span>
                            </span>
                          )}
                        </td>
                        <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--text-muted)' }}>
                          {expandedEvent === event._id ? '[-]' : '[+]'}
                        </td>
                      </tr>
                      {expandedEvent === event._id && (
                        <tr>
                          <td colSpan={9} style={{ padding: 0 }}>
                            <div style={{
                              padding: 16, background: 'var(--bg-primary)',
                              borderTop: '1px solid var(--border-primary)',
                            }}>
                              <div className="grid-2" style={{ gap: 16 }}>
                                <div>
                                  <div style={{
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontSize: 10, fontWeight: 600, color: 'var(--text-muted)',
                                    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8,
                                  }}>DESCRIPTION</div>
                                  <div style={{
                                    fontFamily: "'Inter', sans-serif",
                                    fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5,
                                  }}>{event.description || 'No description available'}</div>
                                </div>
                                <div>
                                  <div style={{
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontSize: 10, fontWeight: 600, color: 'var(--text-muted)',
                                    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8,
                                  }}>PAYLOAD</div>
                                  {event.payload ? (
                                    <div style={{
                                      fontFamily: "'JetBrains Mono', monospace",
                                      fontSize: 11, color: 'var(--accent-red)',
                                      padding: 10, background: 'var(--bg-secondary)',
                                      border: '1px solid var(--border-primary)', borderRadius: 4,
                                      wordBreak: 'break-all',
                                    }}>
                                      <div>Parameter: <span style={{ color: 'var(--text-primary)' }}>{event.payload.parameter}</span></div>
                                      <div style={{ marginTop: 4 }}>Value: <span style={{ color: 'var(--text-secondary)' }}>{event.payload.value}</span></div>
                                    </div>
                                  ) : (
                                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-muted)' }}>
                                      No payload captured
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div style={{ marginTop: 12, display: 'flex', gap: 16 }}>
                                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--text-muted)' }}>
                                  USER AGENT: <span style={{ color: 'var(--text-secondary)' }}>{event.source?.userAgent || 'N/A'}</span>
                                </div>
                                {event.mlScore && (
                                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--text-muted)' }}>
                                    ML CONFIDENCE: <span style={{ color: 'var(--accent-cyan)' }}>{(event.mlScore * 100).toFixed(1)}%</span>
                                  </div>
                                )}
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
          )}
        </div>
      </div>
    </>
  );
};

export default Events;
