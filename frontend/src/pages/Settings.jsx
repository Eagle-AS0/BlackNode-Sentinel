/**
 * BlackNode Sentinel — Settings
 * Security policy configuration
 */
import React, { useState } from 'react';
import Navbar from '../components/Navbar';

export default function Settings() {
  const [settings, setSettings] = useState({
    detectionEngine: true, autoBlock: true, mlDetection: true, emailAlerts: true,
    slackAlerts: false, webhookAlerts: true, otxEnabled: true, cveSync: true,
    rateLimiting: true, geoBlocking: false, ipWhitelist: false,
    blockThreshold: 80, alertEmail: 'soc@blacknode.io', otxApiKey: 'otx_xxxx-xxxx-xxxx',
  });

  const toggle = (key) => setSettings(s => ({ ...s, [key]: !s[key] }));

  const Toggle = ({ label, desc, value, onChange }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #1e293b' }}>
      <div>
        <div style={{ fontSize: 13, color: '#e2e8f0', fontFamily: 'JetBrains Mono, monospace', fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>{desc}</div>
      </div>
      <div onClick={onChange} style={{
        width: 44, height: 24, borderRadius: 12, cursor: 'pointer', position: 'relative',
        background: value ? '#3b82f6' : '#1e293b', border: '1px solid ' + (value ? '#3b82f6' : '#334155'),
        transition: 'background 0.2s',
      }}>
        <div style={{
          width: 18, height: 18, borderRadius: '50%', background: '#e2e8f0', position: 'absolute', top: 2,
          left: value ? 22 : 2, transition: 'left 0.2s',
        }} />
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0e17' }}>
      <Navbar />
      <div style={{ flex: 1, padding: 32, overflow: 'auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#e2e8f0', fontFamily: 'JetBrains Mono, monospace', margin: 0 }}>
            SETTINGS
          </h1>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 8, fontFamily: 'JetBrains Mono, monospace' }}>
            Security policy and detection engine configuration
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 1200 }}>
          {/* Detection Engine */}
          <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 8, padding: 24 }}>
            <h3 style={{ fontSize: 12, color: '#64748b', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', marginTop: 0, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #1e293b' }}>
              DETECTION ENGINE
            </h3>
            <Toggle label="Detection Engine" desc="Master switch for threat detection" value={settings.detectionEngine} onChange={() => toggle('detectionEngine')} />
            <Toggle label="Auto-Block" desc="Automatically block detected threats" value={settings.autoBlock} onChange={() => toggle('autoBlock')} />
            <Toggle label="ML Detection" desc="Machine learning anomaly detection" value={settings.mlDetection} onChange={() => toggle('mlDetection')} />
            <Toggle label="Rate Limiting" desc="API rate limiting per client" value={settings.rateLimiting} onChange={() => toggle('rateLimiting')} />

            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: '#e2e8f0', fontFamily: 'JetBrains Mono, monospace' }}>Block Threshold</span>
                <span style={{ fontSize: 13, color: '#3b82f6', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{settings.blockThreshold}%</span>
              </div>
              <input type="range" min="50" max="100" value={settings.blockThreshold}
                onChange={e => setSettings(s => ({ ...s, blockThreshold: parseInt(e.target.value) }))}
                style={{ width: '100%', accentColor: '#3b82f6' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#475569', fontFamily: 'JetBrains Mono, monospace', marginTop: 4 }}>
                <span>Conservative (50%)</span>
                <span>Aggressive (100%)</span>
              </div>
            </div>
          </div>

          {/* Threat Intelligence */}
          <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 8, padding: 24 }}>
            <h3 style={{ fontSize: 12, color: '#64748b', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', marginTop: 0, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #1e293b' }}>
              THREAT INTELLIGENCE
            </h3>
            <Toggle label="OTX Integration" desc="AlienVault OTX threat feeds" value={settings.otxEnabled} onChange={() => toggle('otxEnabled')} />
            <Toggle label="CVE Sync" desc="Auto-sync CVE/NVD database" value={settings.cveSync} onChange={() => toggle('cveSync')} />
            <Toggle label="Geo Blocking" desc="Block traffic from specific regions" value={settings.geoBlocking} onChange={() => toggle('geoBlocking')} />
            <Toggle label="IP Whitelist" desc="Only allow whitelisted IPs" value={settings.ipWhitelist} onChange={() => toggle('ipWhitelist')} />

            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 10, color: '#475569', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', marginBottom: 8 }}>OTX API KEY</div>
              <input value={settings.otxApiKey} onChange={e => setSettings(s => ({ ...s, otxApiKey: e.target.value }))}
                style={{ width: '100%', padding: '10px 12px', background: '#0f172a', border: '1px solid #1e293b', borderRadius: 4, color: '#e2e8f0', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', boxSizing: 'border-box' }} />
            </div>
          </div>

          {/* Notifications */}
          <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 8, padding: 24 }}>
            <h3 style={{ fontSize: 12, color: '#64748b', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', marginTop: 0, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #1e293b' }}>
              NOTIFICATIONS
            </h3>
            <Toggle label="Email Alerts" desc="Send security alerts via email" value={settings.emailAlerts} onChange={() => toggle('emailAlerts')} />
            <Toggle label="Slack Alerts" desc="Send alerts to Slack channel" value={settings.slackAlerts} onChange={() => toggle('slackAlerts')} />
            <Toggle label="Webhook Alerts" desc="POST alerts to custom webhook" value={settings.webhookAlerts} onChange={() => toggle('webhookAlerts')} />

            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 10, color: '#475569', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', marginBottom: 8 }}>ALERT EMAIL</div>
              <input value={settings.alertEmail} onChange={e => setSettings(s => ({ ...s, alertEmail: e.target.value }))}
                style={{ width: '100%', padding: '10px 12px', background: '#0f172a', border: '1px solid #1e293b', borderRadius: 4, color: '#e2e8f0', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', boxSizing: 'border-box' }} />
            </div>
          </div>

          {/* API Keys */}
          <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 8, padding: 24 }}>
            <h3 style={{ fontSize: 12, color: '#64748b', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', marginTop: 0, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #1e293b' }}>
              API KEYS
            </h3>
            {[
              { name: 'Production API Key', key: 'bn-prod-8f3k2m9x1p4n7w2j6t', created: '2025-01-15' },
              { name: 'Staging API Key', key: 'bn-stag-5p8k3m1x9r4n7w2j6', created: '2025-03-22' },
            ].map((apiKey, i) => (
              <div key={i} style={{ padding: '12px 0', borderBottom: '1px solid #1e293b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#e2e8f0', fontFamily: 'JetBrains Mono, monospace', fontWeight: 500 }}>{apiKey.name}</div>
                    <div style={{ fontSize: 10, color: '#475569', fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>Created {apiKey.created}</div>
                  </div>
                  <button style={{
                    padding: '4px 10px', border: '1px solid #1e293b', borderRadius: 4, background: '#0f172a',
                    color: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono, monospace', cursor: 'pointer',
                  }} onClick={() => navigator.clipboard.writeText(apiKey.key)}>COPY</button>
                </div>
                <div style={{ marginTop: 8, padding: '8px 10px', background: '#0f172a', borderRadius: 4, border: '1px solid #1e293b' }}>
                  <code style={{ fontSize: 11, color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>{apiKey.key.slice(0, 8)}...{apiKey.key.slice(-6)}</code>
                </div>
              </div>
            ))}
            <button style={{
              width: '100%', marginTop: 16, padding: '10px', border: '1px dashed #334155', borderRadius: 4,
              background: 'transparent', color: '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', cursor: 'pointer',
            }}>+ GENERATE NEW KEY</button>
          </div>
        </div>

        {/* Save Button */}
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button style={{
            padding: '10px 24px', border: '1px solid #1e293b', borderRadius: 4, background: '#0f172a',
            color: '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', cursor: 'pointer', letterSpacing: '0.1em',
          }}>RESET DEFAULTS</button>
          <button style={{
            padding: '10px 24px', border: '1px solid #3b82f640', borderRadius: 4, background: '#3b82f620',
            color: '#3b82f6', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', cursor: 'pointer', letterSpacing: '0.1em', fontWeight: 600,
          }}>SAVE CONFIGURATION</button>
        </div>
      </div>
    </div>
  );
}
