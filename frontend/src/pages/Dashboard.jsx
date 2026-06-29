/**
 * BlackNode Sentinel — Dashboard
 * Professional security operations overview
 */
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Navbar from '../components/Navbar';
import anime from 'animejs/lib/anime.es.js';

const Dashboard = () => {
  const { apiClient } = useAuth();
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const gridRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, eventsRes] = await Promise.all([
        apiClient.get('/events/stats/overview'),
        apiClient.get('/events?limit=10'),
      ]);
      setStats(statsRes.data.data);
      setEvents(eventsRes.data.data || []);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (!loading && gridRef.current) {
      anime({
        targets: gridRef.current.querySelectorAll('.stat-card'),
        opacity: [0, 1],
        translateY: [12, 0],
        duration: 350,
        delay: anime.stagger(60),
        easing: 'easeOutCubic',
      });
    }
  }, [loading]);

  const total = stats?.total?.[0]?.count || 0;
  const blocked = stats?.blocked?.[0]?.count || 0;
  const blockRate = total > 0 ? ((blocked / total) * 100).toFixed(1) : 0;

  const severityData = (stats?.bySeverity || []).map(s => ({
    name: s._id?.toUpperCase(),
    value: s.count,
    color: s._id === 'critical' ? '#ff1744' : s._id === 'high' ? '#ff9100' : s._id === 'medium' ? '#ffd600' : '#448aff',
  }));

  const typeData = (stats?.byType || []).map(t => ({
    name: t._id?.replace(/_/g, ' ').toUpperCase(),
    value: t.count,
  }));

  const getSeverityRowClass = (sev) => {
    if (sev === 'critical') return 'row-critical';
    if (sev === 'high') return 'row-high';
    if (sev === 'medium') return 'row-medium';
    return '';
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto 12px' }} />
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--text-muted)' }}>
              Loading threat data...
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="main-content">
        <div className="page-header">
          <h1>
            <span style={{
              width: 28, height: 28, borderRadius: 6,
              background: 'rgba(0, 230, 118, 0.1)',
              border: '1px solid rgba(0, 230, 118, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: 'var(--accent-green)',
            }}>D</span>
            Security Overview
          </h1>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div className="status-dot online" />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--accent-green)' }}>
                SYSTEMS OPERATIONAL
              </span>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div ref={gridRef} className="grid-4" style={{ marginBottom: 24 }}>
          <div className="card-stat stat-card" style={{ opacity: 0 }}>
            <div className="stat-label">TOTAL EVENTS</div>
            <div className="stat-value" style={{ color: 'var(--text-primary)' }}>{total}</div>
            <div className="stat-change neutral">Last 24 hours</div>
          </div>
          <div className="card-stat stat-card" style={{ opacity: 0 }}>
            <div className="stat-label">BLOCKED</div>
            <div className="stat-value" style={{ color: 'var(--accent-green)' }}>{blocked}</div>
            <div className="stat-change down">{blockRate}% block rate</div>
          </div>
          <div className="card-stat stat-card" style={{ opacity: 0 }}>
            <div className="stat-label">CRITICAL</div>
            <div className="stat-value" style={{ color: 'var(--accent-red)' }}>
              {stats?.bySeverity?.find(s => s._id === 'critical')?.count || 0}
            </div>
            <div className="stat-change up">Requires attention</div>
          </div>
          <div className="card-stat stat-card" style={{ opacity: 0 }}>
            <div className="stat-label">ATTACK TYPES</div>
            <div className="stat-value" style={{ color: 'var(--accent-cyan)' }}>
              {stats?.byType?.length || 0}
            </div>
            <div className="stat-change neutral">Unique vectors</div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid-2" style={{ marginBottom: 24 }}>
          {/* Severity Distribution */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16,
            }}>
              SEVERITY DISTRIBUTION
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={severityData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" strokeWidth={0}>
                    {severityData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1 }}>
                {severityData.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-secondary)' }}>
                        {s.name}
                      </span>
                    </div>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 600, color: s.color }}>
                      {s.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Attack Types */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16,
            }}>
              ATTACK VECTORS
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={typeData} layout="vertical" margin={{ left: 0, right: 10 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10, fill: '#8888a0', fontFamily: "'JetBrains Mono', monospace" }} />
                <Bar dataKey="value" fill="var(--accent-green)" radius={[0, 3, 3, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Events Table */}
        <div className="card">
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16,
          }}>
            RECENT SECURITY EVENTS
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Type</th>
                  <th>Severity</th>
                  <th>Source</th>
                  <th>Target</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {events.slice(0, 10).map((event, i) => (
                  <tr key={event._id || i} className={getSeverityRowClass(event.severity)}>
                    <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-muted)' }}>
                      {new Date(event.createdAt).toLocaleTimeString()}
                    </td>
                    <td>
                      <span style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 11, fontWeight: 500, color: 'var(--text-primary)',
                        textTransform: 'uppercase',
                      }}>
                        {event.eventType?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${event.severity}`}>{event.severity}</span>
                    </td>
                    <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
                      {event.source?.ip || 'N/A'}
                    </td>
                    <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-muted)' }}>
                      {event.source?.path || 'N/A'}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
