/**
 * BlackNode Sentinel — Applications
 * Enterprise application monitoring registry
 */
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { applications } from '../data/realData';

const threatColors = { critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#3b82f6', none: '#10b981' };

export default function Applications() {
  const [selectedApp, setSelectedApp] = useState(null);
  const [showInstallModal, setShowInstallModal] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0e17' }}>
      <Navbar />
      <div style={{ flex: 1, padding: 32, overflow: 'auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#e2e8f0', fontFamily: 'JetBrains Mono, monospace', margin: 0 }}>
            MONITORED APPLICATIONS
          </h1>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 8, fontFamily: 'JetBrains Mono, monospace' }}>
            {applications.length} enterprise applications under active protection
          </p>
        </div>

        {/* Summary Bar */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'ACTIVE', value: applications.filter(a => a.status === 'active').length, color: '#10b981' },
            { label: 'CRITICAL THREAT', value: applications.filter(a => a.threatLevel === 'critical').length, color: '#ef4444' },
            { label: 'TOTAL EVENTS', value: applications.reduce((s, a) => s + a.eventsCount, 0).toLocaleString(), color: '#3b82f6' },
            { label: 'BLOCKED', value: applications.reduce((s, a) => s + a.blockedCount, 0).toLocaleString(), color: '#10b981' },
          ].map((item, i) => (
            <div key={i} style={{
              flex: 1,
              background: '#111827',
              border: '1px solid #1e293b',
              borderRadius: 8,
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}>
              <div style={{ width: 4, height: 32, background: item.color, borderRadius: 2 }} />
              <div>
                <div style={{ fontSize: 10, color: '#64748b', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em' }}>{item.label}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#e2e8f0', fontFamily: 'JetBrains Mono, monospace' }}>{item.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Applications Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340, 1fr))', gap: 16 }}>
          {applications.map((app) => (
            <div key={app.id} style={{
              background: 'linear-gradient(135deg, #111827 0%, #0f172a 100%)',
              border: '1px solid #1e293b',
              borderRadius: 8,
              padding: 24,
              cursor: 'pointer',
              transition: 'border-color 0.2s, transform 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#3b82f640'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e293b'; e.currentTarget.style.transform = 'none'; }}
              onClick={() => setSelectedApp(app)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: '#e2e8f0', fontFamily: 'JetBrains Mono, monospace', margin: 0 }}>{app.name}</h3>
                  <span style={{ fontSize: 11, color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>{app.url}</span>
                </div>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: threatColors[app.threatLevel],
                  boxShadow: `0 0 8px ${threatColors[app.threatLevel]}`,
                }} />
              </div>

              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <span style={{ padding: '3px 8px', borderRadius: 4, fontSize: 10, fontFamily: 'JetBrains Mono, monospace', background: '#1e293b', color: '#94a3b8', border: '1px solid #334155' }}>{app.language}</span>
                <span style={{ padding: '3px 8px', borderRadius: 4, fontSize: 10, fontFamily: 'JetBrains Mono, monospace', background: '#1e293b', color: '#94a3b8', border: '1px solid #334155' }}>{app.framework}</span>
                <span style={{ padding: '3px 8px', borderRadius: 4, fontSize: 10, fontFamily: 'JetBrains Mono, monospace', background: '#1e293b', color: '#10b981', border: '1px solid #10b98140' }}>{app.environment}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 10, color: '#64748b', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em' }}>EVENTS</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#3b82f6', fontFamily: 'JetBrains Mono, monospace' }}>{app.eventsCount}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: '#64748b', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em' }}>BLOCKED</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#10b981', fontFamily: 'JetBrains Mono, monospace' }}>{app.blockedCount}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: '#64748b', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em' }}>UPTIME</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0', fontFamily: 'JetBrains Mono, monospace' }}>{app.uptime}%</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{
                  flex: 1, padding: '8px 0', border: '1px solid #1e293b', borderRadius: 4, background: '#0f172a',
                  color: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono, monospace', cursor: 'pointer', letterSpacing: '0.1em',
                }}>VIEW EVENTS</button>
                <button style={{
                  flex: 1, padding: '8px 0', border: '1px solid #3b82f640', borderRadius: 4, background: '#3b82f610',
                  color: '#3b82f6', fontSize: 10, fontFamily: 'JetBrains Mono, monospace', cursor: 'pointer', letterSpacing: '0.1em',
                }}
                  onClick={(e) => { e.stopPropagation(); setSelectedApp(app); setShowInstallModal(true); }}>
                  INSTALL AGENT
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Install Agent Modal */}
        {showInstallModal && selectedApp && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          }} onClick={() => setShowInstallModal(false)}>
            <div style={{
              background: '#111827', border: '1px solid #1e293b', borderRadius: 8, padding: 32,
              maxWidth: 560, width: '100%', maxHeight: '80vh', overflow: 'auto',
            }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: 18, color: '#e2e8f0', fontFamily: 'JetBrains Mono, monospace', margin: 0 }}>INSTALL AGENT</h2>
                <button style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 20, cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace' }} onClick={() => setShowInstallModal(false)}>X</button>
              </div>

              <p style={{ color: '#94a3b8', fontSize: 13, fontFamily: 'JetBrains Mono, monospace', marginBottom: 16 }}>
                Add the BlackNode agent to {selectedApp.name}:
              </p>

              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 4, padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 10, color: '#64748b', fontFamily: 'JetBrains Mono, monospace', marginBottom: 8, letterSpacing: '0.1em' }}>STEP 1 — INSTALL</div>
                <code style={{ color: '#10b981', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>npm install blacknode-agent</code>
              </div>

              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 4, padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 10, color: '#64748b', fontFamily: 'JetBrains Mono, monospace', marginBottom: 8, letterSpacing: '0.1em' }}>STEP 2 — CONFIGURE</div>
                <pre style={{ color: '#e2e8f0', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', margin: 0, whiteSpace: 'pre-wrap' }}>{`const BlackNodeAgent = require('blacknode-agent');
const agent = new BlackNodeAgent({
  serverUrl: '${window.location.origin}/api',
  agentKey: '${selectedApp.agentKey}',
  appUrl: '${selectedApp.url}'
});
app.use(agent.middleware());`}</pre>
              </div>

              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 4, padding: 16 }}>
                <div style={{ fontSize: 10, color: '#64748b', fontFamily: 'JetBrains Mono, monospace', marginBottom: 8, letterSpacing: '0.1em' }}>AGENT KEY</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <code style={{ color: '#3b82f6', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', flex: 1 }}>{selectedApp.agentKey}</code>
                  <button style={{
                    padding: '6px 12px', border: '1px solid #3b82f640', borderRadius: 4, background: '#3b82f610',
                    color: '#3b82f6', fontSize: 10, fontFamily: 'JetBrains Mono, monospace', cursor: 'pointer',
                  }} onClick={() => navigator.clipboard.writeText(selectedApp.agentKey)}>COPY</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
