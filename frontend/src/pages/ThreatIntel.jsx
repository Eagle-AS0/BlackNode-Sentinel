/**
 * BlackNode Sentinel — Threat Intelligence
 * CVE database and OTX threat feeds
 */
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { cveData as initialCveData, otxPulses as initialOtxPulses } from '../data/realData';

const severityColors = { critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#3b82f6' };

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  background: '#0f172a',
  border: '1px solid #1e293b',
  borderRadius: 4,
  color: '#e2e8f0',
  fontSize: 12,
  fontFamily: 'JetBrains Mono, monospace',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle = {
  fontSize: 10,
  color: '#64748b',
  fontFamily: 'JetBrains Mono, monospace',
  letterSpacing: '0.1em',
  marginBottom: 6,
  display: 'block',
};

export default function ThreatIntel() {
  const [activeTab, setActiveTab] = useState('cve');
  const [expandedItem, setExpandedItem] = useState(null);
  const [cves, setCves] = useState(initialCveData);
  const [pulses, setPulses] = useState(initialOtxPulses);

  // ── Add CVE state ──
  const [showAddCve, setShowAddCve] = useState(false);
  const [newCve, setNewCve] = useState({
    id: '', severity: 'high', cvss: '', title: '', description: '', affected: '', published: '', references: '',
  });

  // ── Add Pulse state ──
  const [showAddPulse, setShowAddPulse] = useState(false);
  const [newPulse, setNewPulse] = useState({
    name: '', author: '', tags: '', description: '', ttps: '',
  });

  const handleAddCve = () => {
    if (!newCve.id.trim() || !newCve.title.trim()) return;
    const entry = {
      id: newCve.id.trim(),
      severity: newCve.severity,
      cvss: parseFloat(newCve.cvss) || 0,
      title: newCve.title,
      description: newCve.description || 'No description provided.',
      affected: newCve.affected || 'Unknown',
      published: newCve.published || new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
      references: newCve.references ? newCve.references.split(',').map(r => r.trim()) : ['Manual Entry'],
    };
    setCves([entry, ...cves]);
    setNewCve({ id: '', severity: 'high', cvss: '', title: '', description: '', affected: '', published: '', references: '' });
    setShowAddCve(false);
  };

  const handleAddPulse = () => {
    if (!newPulse.name.trim()) return;
    const entry = {
      id: `otx-${String(pulses.length + 1).padStart(3, '0')}`,
      name: newPulse.name,
      author: newPulse.author || 'Internal',
      created: new Date().toISOString().split('T')[0],
      tags: newPulse.tags ? newPulse.tags.split(',').map(t => t.trim()) : [],
      indicatorCount: 0,
      ttps: newPulse.ttps ? newPulse.ttps.split(',').map(t => t.trim()) : [],
      description: newPulse.description || 'No description provided.',
    };
    setPulses([entry, ...pulses]);
    setNewPulse({ name: '', author: '', tags: '', description: '', ttps: '' });
    setShowAddPulse(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0e17' }}>
      <Navbar />
      <div style={{ flex: 1, padding: 32, overflow: 'auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#e2e8f0', fontFamily: 'JetBrains Mono, monospace', margin: 0 }}>
            THREAT INTELLIGENCE
          </h1>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 8, fontFamily: 'JetBrains Mono, monospace' }}>
            {cves.length} CVE entries — {pulses.length} OTX threat feeds
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 24, alignItems: 'center' }}>
          {[
            { id: 'cve', label: 'CVE DATABASE', count: cves.length },
            { id: 'otx', label: 'OTX FEEDS', count: pulses.length },
          ].map(tab => (
            <button key={tab.id}
              onClick={() => { setActiveTab(tab.id); setExpandedItem(null); }}
              style={{
                padding: '12px 24px',
                background: activeTab === tab.id ? '#111827' : 'transparent',
                border: '1px solid ' + (activeTab === tab.id ? '#1e293b' : 'transparent'),
                borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                color: activeTab === tab.id ? '#e2e8f0' : '#64748b',
                fontSize: 11,
                fontFamily: 'JetBrains Mono, monospace',
                letterSpacing: '0.1em',
                cursor: 'pointer',
                fontWeight: 600,
                borderRadius: '4px 4px 0 0',
              }}>
              {tab.label} ({tab.count})
            </button>
          ))}
          <div style={{ flex: 1 }} />
          {activeTab === 'cve' && (
            <button
              onClick={() => setShowAddCve(true)}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                border: 'none',
                borderRadius: 6,
                color: '#fff',
                fontSize: 11,
                fontFamily: 'JetBrains Mono, monospace',
                letterSpacing: '0.1em',
                cursor: 'pointer',
                fontWeight: 600,
                boxShadow: '0 0 15px rgba(239, 68, 68, 0.3)',
              }}
            >
              + NEW CVE
            </button>
          )}
          {activeTab === 'otx' && (
            <button
              onClick={() => setShowAddPulse(true)}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                border: 'none',
                borderRadius: 6,
                color: '#fff',
                fontSize: 11,
                fontFamily: 'JetBrains Mono, monospace',
                letterSpacing: '0.1em',
                cursor: 'pointer',
                fontWeight: 600,
                boxShadow: '0 0 15px rgba(139, 92, 246, 0.3)',
              }}
            >
              + NEW PULSE
            </button>
          )}
        </div>

        {/* CVE Tab */}
        {activeTab === 'cve' && (
          <div style={{ display: 'grid', gap: 12 }}>
            {cves.map((cve) => (
              <div key={cve.id} style={{
                background: 'linear-gradient(135deg, #111827 0%, #0f172a 100%)',
                border: '1px solid #1e293b',
                borderRadius: 8,
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
                onClick={() => setExpandedItem(expandedItem === cve.id ? null : cve.id)}
                onMouseEnter={e => e.currentTarget.style.borderColor = severityColors[cve.severity] + '60'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#1e293b'}>
                <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
                  {/* Severity Badge */}
                  <div style={{
                    minWidth: 56,
                    padding: '4px 0',
                    background: severityColors[cve.severity] + '20',
                    border: '1px solid ' + severityColors[cve.severity] + '40',
                    borderRadius: 4,
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: severityColors[cve.severity], fontFamily: 'JetBrains Mono, monospace' }}>{cve.cvss}</div>
                    <div style={{ fontSize: 8, color: severityColors[cve.severity], fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>CVSS</div>
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#3b82f6', fontFamily: 'JetBrains Mono, monospace' }}>{cve.id}</span>
                      <span style={{
                        padding: '1px 6px', borderRadius: 3, fontSize: 9, fontFamily: 'JetBrains Mono, monospace',
                        fontWeight: 600, textTransform: 'uppercase',
                        background: severityColors[cve.severity] + '20', color: severityColors[cve.severity],
                        border: '1px solid ' + severityColors[cve.severity] + '40',
                      }}>{cve.severity}</span>
                      <span style={{ padding: '1px 6px', borderRadius: 3, fontSize: 9, fontFamily: 'JetBrains Mono, monospace', background: '#10b98120', color: '#10b981', border: '1px solid #10b98140' }}>{cve.status}</span>
                    </div>
                    <div style={{ fontSize: 14, color: '#e2e8f0', fontFamily: 'JetBrains Mono, monospace', fontWeight: 500 }}>{cve.title}</div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 10, color: '#475569', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em' }}>PUBLISHED</div>
                    <div style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace' }}>{cve.published}</div>
                  </div>
                </div>

                {expandedItem === cve.id && (
                  <div style={{ padding: '0 24px 16px', borderTop: '1px solid #1e293b', paddingTop: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
                      <div>
                        <div style={{ fontSize: 10, color: '#475569', fontFamily: 'JetBrains Mono, monospace', marginBottom: 8, letterSpacing: '0.1em' }}>DESCRIPTION</div>
                        <p style={{ color: '#e2e8f0', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', margin: 0, lineHeight: 1.6 }}>{cve.description}</p>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: '#475569', fontFamily: 'JetBrains Mono, monospace', marginBottom: 8, letterSpacing: '0.1em' }}>AFFECTED</div>
                        <p style={{ color: '#f97316', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', margin: 0, lineHeight: 1.6 }}>{cve.affected}</p>
                        <div style={{ fontSize: 10, color: '#475569', fontFamily: 'JetBrains Mono, monospace', marginTop: 16, marginBottom: 8, letterSpacing: '0.1em' }}>REFERENCES</div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {cve.references.map(ref => (
                            <span key={ref} style={{ padding: '2px 8px', borderRadius: 3, fontSize: 10, fontFamily: 'JetBrains Mono, monospace', background: '#1e293b', color: '#94a3b8', border: '1px solid #334155' }}>{ref}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* OTX Tab */}
        {activeTab === 'otx' && (
          <div style={{ display: 'grid', gap: 12 }}>
            {pulses.map((pulse) => (
              <div key={pulse.id} style={{
                background: 'linear-gradient(135deg, #111827 0%, #0f172a 100%)',
                border: '1px solid #1e293b',
                borderRadius: 8,
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
                onClick={() => setExpandedItem(expandedItem === pulse.id ? null : pulse.id)}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#8b5cf640'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#1e293b'}>
                <div style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', fontFamily: 'JetBrains Mono, monospace', marginBottom: 4 }}>{pulse.name}</div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: '#8b5cf6', fontFamily: 'JetBrains Mono, monospace' }}>{pulse.author}</span>
                        <span style={{ color: '#334155' }}>|</span>
                        <span style={{ fontSize: 11, color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>{pulse.created}</span>
                        <span style={{ color: '#334155' }}>|</span>
                        <span style={{ fontSize: 11, color: '#3b82f6', fontFamily: 'JetBrains Mono, monospace' }}>{pulse.indicatorCount} indicators</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                    {pulse.tags.map(tag => (
                      <span key={tag} style={{
                        padding: '2px 8px', borderRadius: 3, fontSize: 9, fontFamily: 'JetBrains Mono, monospace',
                        background: '#8b5cf615', color: '#8b5cf6', border: '1px solid #8b5cf630',
                      }}>{tag}</span>
                    ))}
                  </div>
                </div>

                {expandedItem === pulse.id && (
                  <div style={{ padding: '0 24px 16px', borderTop: '1px solid #1e293b', paddingTop: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
                      <div>
                        <div style={{ fontSize: 10, color: '#475569', fontFamily: 'JetBrains Mono, monospace', marginBottom: 8, letterSpacing: '0.1em' }}>DESCRIPTION</div>
                        <p style={{ color: '#e2e8f0', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', margin: 0, lineHeight: 1.6 }}>{pulse.description}</p>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: '#475569', fontFamily: 'JetBrains Mono, monospace', marginBottom: 8, letterSpacing: '0.1em' }}>MITRE ATT&CK TTPs</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {pulse.ttps.map(ttp => (
                            <span key={ttp} style={{
                              padding: '4px 8px', borderRadius: 3, fontSize: 11, fontFamily: 'JetBrains Mono, monospace',
                              background: '#ef444415', color: '#ef4444', border: '1px solid #ef444430',
                            }}>{ttp}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Add CVE Modal ── */}
        {showAddCve && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          }} onClick={() => setShowAddCve(false)}>
            <div style={{
              background: '#111827', border: '1px solid #1e293b', borderRadius: 8, padding: 32,
              maxWidth: 560, width: '100%', maxHeight: '80vh', overflow: 'auto',
            }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: 18, color: '#e2e8f0', fontFamily: 'JetBrains Mono, monospace', margin: 0 }}>NEW CVE ENTRY</h2>
                <button style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 20, cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace' }} onClick={() => setShowAddCve(false)}>X</button>
              </div>

              <div style={{ display: 'grid', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>CVE ID *</label>
                    <input
                      style={inputStyle}
                      placeholder="e.g. CVE-2025-12345"
                      value={newCve.id}
                      onChange={e => setNewCve({ ...newCve, id: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>CVSS SCORE</label>
                    <input
                      style={inputStyle}
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      placeholder="0.0 - 10.0"
                      value={newCve.cvss}
                      onChange={e => setNewCve({ ...newCve, cvss: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>TITLE *</label>
                  <input
                    style={inputStyle}
                    placeholder="e.g. Remote Code Execution in XYZ"
                    value={newCve.title}
                    onChange={e => setNewCve({ ...newCve, title: e.target.value })}
                  />
                </div>
                <div>
                  <label style={labelStyle}>SEVERITY</label>
                  <select
                    style={{ ...inputStyle, cursor: 'pointer' }}
                    value={newCve.severity}
                    onChange={e => setNewCve({ ...newCve, severity: e.target.value })}
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>DESCRIPTION</label>
                  <textarea
                    style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }}
                    placeholder="Detailed description of the vulnerability..."
                    value={newCve.description}
                    onChange={e => setNewCve({ ...newCve, description: e.target.value })}
                  />
                </div>
                <div>
                  <label style={labelStyle}>AFFECTED SOFTWARE</label>
                  <input
                    style={inputStyle}
                    placeholder="e.g. Apache 2.4.x, OpenSSL 3.x"
                    value={newCve.affected}
                    onChange={e => setNewCve({ ...newCve, affected: e.target.value })}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>PUBLISHED DATE</label>
                    <input
                      style={inputStyle}
                      type="date"
                      value={newCve.published}
                      onChange={e => setNewCve({ ...newCve, published: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>REFERENCES (comma-separated)</label>
                    <input
                      style={inputStyle}
                      placeholder="NVD, MITRE, CISA KEV"
                      value={newCve.references}
                      onChange={e => setNewCve({ ...newCve, references: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button
                  onClick={() => setShowAddCve(false)}
                  style={{
                    flex: 1, padding: '10px 0', border: '1px solid #1e293b', borderRadius: 4, background: '#0f172a',
                    color: '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', cursor: 'pointer', letterSpacing: '0.1em',
                  }}
                >CANCEL</button>
                <button
                  onClick={handleAddCve}
                  style={{
                    flex: 1, padding: '10px 0', border: 'none', borderRadius: 4,
                    background: (newCve.id.trim() && newCve.title.trim()) ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' : '#1e293b',
                    color: (newCve.id.trim() && newCve.title.trim()) ? '#fff' : '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono, monospace',
                    cursor: (newCve.id.trim() && newCve.title.trim()) ? 'pointer' : 'not-allowed', letterSpacing: '0.1em', fontWeight: 600,
                  }}
                >ADD CVE</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Add OTX Pulse Modal ── */}
        {showAddPulse && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          }} onClick={() => setShowAddPulse(false)}>
            <div style={{
              background: '#111827', border: '1px solid #1e293b', borderRadius: 8, padding: 32,
              maxWidth: 560, width: '100%', maxHeight: '80vh', overflow: 'auto',
            }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: 18, color: '#e2e8f0', fontFamily: 'JetBrains Mono, monospace', margin: 0 }}>NEW THREAT PULSE</h2>
                <button style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 20, cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace' }} onClick={() => setShowAddPulse(false)}>X</button>
              </div>

              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <label style={labelStyle}>PULSE NAME *</label>
                  <input
                    style={inputStyle}
                    placeholder="e.g. APT29 — New C2 Infrastructure"
                    value={newPulse.name}
                    onChange={e => setNewPulse({ ...newPulse, name: e.target.value })}
                  />
                </div>
                <div>
                  <label style={labelStyle}>AUTHOR / SOURCE</label>
                  <input
                    style={inputStyle}
                    placeholder="e.g. CISA, CrowdStrike, Internal"
                    value={newPulse.author}
                    onChange={e => setNewPulse({ ...newPulse, author: e.target.value })}
                  />
                </div>
                <div>
                  <label style={labelStyle}>DESCRIPTION</label>
                  <textarea
                    style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }}
                    placeholder="Description of the threat intelligence..."
                    value={newPulse.description}
                    onChange={e => setNewPulse({ ...newPulse, description: e.target.value })}
                  />
                </div>
                <div>
                  <label style={labelStyle}>TAGS (comma-separated)</label>
                  <input
                    style={inputStyle}
                    placeholder="e.g. apt29, russia, oauth, cloud"
                    value={newPulse.tags}
                    onChange={e => setNewPulse({ ...newPulse, tags: e.target.value })}
                  />
                </div>
                <div>
                  <label style={labelStyle}>MITRE ATT&CK TTPs (comma-separated)</label>
                  <input
                    style={inputStyle}
                    placeholder="e.g. T1550.001, T1078.004, T1539"
                    value={newPulse.ttps}
                    onChange={e => setNewPulse({ ...newPulse, ttps: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button
                  onClick={() => setShowAddPulse(false)}
                  style={{
                    flex: 1, padding: '10px 0', border: '1px solid #1e293b', borderRadius: 4, background: '#0f172a',
                    color: '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', cursor: 'pointer', letterSpacing: '0.1em',
                  }}
                >CANCEL</button>
                <button
                  onClick={handleAddPulse}
                  style={{
                    flex: 1, padding: '10px 0', border: 'none', borderRadius: 4,
                    background: newPulse.name.trim() ? 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' : '#1e293b',
                    color: newPulse.name.trim() ? '#fff' : '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono, monospace',
                    cursor: newPulse.name.trim() ? 'pointer' : 'not-allowed', letterSpacing: '0.1em', fontWeight: 600,
                  }}
                >ADD PULSE</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
