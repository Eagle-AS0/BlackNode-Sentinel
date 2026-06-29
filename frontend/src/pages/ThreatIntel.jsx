/**
 * BlackNode Sentinel — Threat Intelligence
 * CVE database and OTX threat feeds
 */
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { cveData, otxPulses } from '../data/realData';

const severityColors = { critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#3b82f6' };

export default function ThreatIntel() {
  const [activeTab, setActiveTab] = useState('cve');
  const [expandedItem, setExpandedItem] = useState(null);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0e17' }}>
      <Navbar />
      <div style={{ flex: 1, padding: 32, overflow: 'auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#e2e8f0', fontFamily: 'JetBrains Mono, monospace', margin: 0 }}>
            THREAT INTELLIGENCE
          </h1>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 8, fontFamily: 'JetBrains Mono, monospace' }}>
            {cveData.length} CVE entries — {otxPulses.length} OTX threat feeds
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 24 }}>
          {[
            { id: 'cve', label: 'CVE DATABASE', count: cveData.length },
            { id: 'otx', label: 'OTX FEEDS', count: otxPulses.length },
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
        </div>

        {/* CVE Tab */}
        {activeTab === 'cve' && (
          <div style={{ display: 'grid', gap: 12 }}>
            {cveData.map((cve) => (
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
                        <div style={{ display: 'flex', gap: 6 }}>
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
            {otxPulses.map((pulse) => (
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
      </div>
    </div>
  );
}
