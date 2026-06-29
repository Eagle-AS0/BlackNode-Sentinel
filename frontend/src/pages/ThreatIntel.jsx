/**
 * BlackNode Sentinel — Threat Intelligence
 * CVE database and OTX threat feeds
 */
import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar';

const ThreatIntel = () => {
  const { apiClient } = useAuth();
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('otx');

  const fetchThreats = useCallback(async () => {
    try {
      const res = await apiClient.get('/threat-intel');
      setThreats(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  useEffect(() => { fetchThreats(); }, [fetchThreats]);

  const otxPulses = threats.filter(t => t.source === 'otx');
  const cveItems = threats.filter(t => t.source === 'cve' || t.type === 'cve');

  const formatDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  return (
    <>
      <Navbar />
      <div className="main-content">
        <div className="page-header">
          <h1>
            <span style={{
              width: 28, height: 28, borderRadius: 6,
              background: 'rgba(124, 77, 255, 0.1)',
              border: '1px solid rgba(124, 77, 255, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: 'var(--accent-purple)',
            }}>T</span>
            Threat Intelligence
          </h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className={`btn-secondary ${activeTab === 'otx' ? 'btn-cyan' : ''}`}
              onClick={() => setActiveTab('otx')}
              style={activeTab === 'otx' ? { borderColor: 'var(--accent-cyan)', color: 'var(--accent-cyan)' } : {}}
            >
              OTX Feeds
            </button>
            <button
              className={`btn-secondary ${activeTab === 'cve' ? 'btn-cyan' : ''}`}
              onClick={() => setActiveTab('cve')}
              style={activeTab === 'cve' ? { borderColor: 'var(--accent-cyan)', color: 'var(--accent-cyan)' } : {}}
            >
              CVE Database
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div className="spinner" />
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid-3" style={{ marginBottom: 24 }}>
              <div className="card-stat">
                <div className="stat-label">FEEDS ACTIVE</div>
                <div className="stat-value" style={{ color: 'var(--accent-green)', fontSize: 24 }}>{threats.length}</div>
                <div className="stat-change neutral">Last 24 hours</div>
              </div>
              <div className="card-stat">
                <div className="stat-label">CRITICAL CVEs</div>
                <div className="stat-value" style={{ color: 'var(--accent-red)', fontSize: 24 }}>
                  {cveItems.filter(t => t.severity === 'critical').length}
                </div>
                <div className="stat-change up">Requires patching</div>
              </div>
              <div className="card-stat">
                <div className="stat-label">IOCs DETECTED</div>
                <div className="stat-value" style={{ color: 'var(--accent-cyan)', fontSize: 24 }}>
                  {otxPulses.length}
                </div>
                <div className="stat-change neutral">Indicators of compromise</div>
              </div>
            </div>

            {/* Threat List */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {activeTab === 'otx' ? (
                <>
                  <div style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border-primary)',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
                    textTransform: 'uppercase', letterSpacing: 1,
                  }}>
                    OTX ALIEN VAULT FEEDS
                  </div>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Pulse Name</th>
                        <th>Severity</th>
                        <th>IOCs</th>
                        <th>Tags</th>
                        <th>Created</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {otxPulses.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: 30 }}>
                            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--text-muted)' }}>
                              No OTX feeds available. Configure OTX API key in Settings.
                            </span>
                          </td>
                        </tr>
                      ) : (
                        otxPulses.map((pulse, i) => (
                          <tr key={pulse._id || i} className={pulse.severity === 'critical' ? 'row-critical' : ''}>
                            <td style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                              {pulse.name || pulse.title}
                            </td>
                            <td>
                              <span className={`badge badge-${pulse.severity || 'info'}`}>{pulse.severity || 'info'}</span>
                            </td>
                            <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-secondary)' }}>
                              {pulse.iocCount || pulse.indicators?.length || 0}
                            </td>
                            <td style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                              {(pulse.tags || []).slice(0, 3).map((tag, j) => (
                                <span key={j} style={{
                                  fontFamily: "'JetBrains Mono', monospace",
                                  fontSize: 9, padding: '2px 6px',
                                  background: 'var(--bg-primary)',
                                  border: '1px solid var(--border-primary)',
                                  borderRadius: 3, color: 'var(--text-muted)',
                                }}>{tag}</span>
                              ))}
                            </td>
                            <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-muted)' }}>
                              {formatDate(pulse.createdAt || pulse.created)}
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                <div className="status-dot online" />
                                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--accent-green)' }}>ACTIVE</span>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </>
              ) : (
                <>
                  <div style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border-primary)',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
                    textTransform: 'uppercase', letterSpacing: 1,
                  }}>
                    CVE VULNERABILITY DATABASE
                  </div>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>CVE ID</th>
                        <th>Severity</th>
                        <th>CVSS</th>
                        <th>Description</th>
                        <th>Affected</th>
                        <th>Published</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cveItems.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: 30 }}>
                            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--text-muted)' }}>
                              No CVE data available. Threat intel feeds are being synced.
                            </span>
                          </td>
                        </tr>
                      ) : (
                        cveItems.map((cve, i) => (
                          <tr key={cve._id || i} className={cve.severity === 'critical' ? 'row-critical' : cve.severity === 'high' ? 'row-high' : ''}>
                            <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--accent-cyan)', fontWeight: 500 }}>
                              {cve.cveId || cve.name}
                            </td>
                            <td>
                              <span className={`badge badge-${cve.severity || 'info'}`}>{cve.severity || 'info'}</span>
                            </td>
                            <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 600, color: cve.cvss >= 9 ? 'var(--accent-red)' : cve.cvss >= 7 ? 'var(--accent-orange)' : 'var(--text-secondary)' }}>
                              {cve.cvss || 'N/A'}
                            </td>
                            <td style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: 'var(--text-secondary)', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {cve.description}
                            </td>
                            <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-muted)' }}>
                              {cve.affected || 'Multiple'}
                            </td>
                            <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-muted)' }}>
                              {formatDate(cve.publishedAt || cve.createdAt)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ThreatIntel;
