/**
 * BlackNode Sentinel — Settings
 * Security policy configuration with working actions
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../hooks/useAuth';

const defaultSettings = {
  detectionEngine: true, autoBlock: true, mlDetection: true, emailAlerts: true,
  slackAlerts: false, webhookAlerts: true, otxEnabled: true, cveSync: true,
  rateLimiting: true, geoBlocking: false, ipWhitelist: false,
  blockThreshold: 80, alertEmail: 'soc@blacknode.io', otxApiKey: 'otx_x...xx',
};

const defaultKeys = [
  { name: 'Production API Key', key: 'bn-prod-8f3k2m9x1p4n7w2j6t', created: '2025-01-15' },
  { name: 'Staging API Key', key: 'bn-stag-5p8k3m1x9r4n7w2j6', created: '2025-03-22' },
];

const inputStyle = {
  width: '100%', padding: '10px 12px', background: '#0f172a', border: '1px solid #1e293b',
  borderRadius: 4, color: '#e2e8f0', fontSize: 12, fontFamily: 'JetBrains Mono, monospace',
  boxSizing: 'border-box', outline: 'none',
};

export default function Settings() {
  const [settings, setSettings] = useState({ ...defaultSettings });
  const [apiKeys, setApiKeys] = useState([...defaultKeys]);
  const [toast, setToast] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const toggle = (key) => setSettings(s => ({ ...s, [key]: !s[key] }));

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = () => {
    showToast('Configuration saved successfully');
  };

  const handleReset = () => {
    setSettings({ ...defaultSettings });
    setShowResetConfirm(false);
    showToast('Settings reset to defaults');
  };

  const handleGenerateKey = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const rand = (n) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const newKey = {
      name: `API Key ${apiKeys.length + 1}`,
      key: `bn-${rand(4)}-${rand(20)}`,
      created: new Date().toISOString().split('T')[0],
    };
    setApiKeys([...apiKeys, newKey]);
    showToast('New API key generated');
  };

  const handleDeleteKey = (index) => {
    setApiKeys(apiKeys.filter((_, i) => i !== index));
    showToast('API key revoked');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
        {/* Toast */}
        {toast && (
          <div style={{
            position: 'fixed', top: 20, right: 20, zIndex: 2000,
            padding: '12px 20px', borderRadius: 6,
            background: toast.type === 'success' ? '#10b98120' : '#ef444420',
            border: '1px solid ' + (toast.type === 'success' ? '#10b98140' : '#ef444440'),
            color: toast.type === 'success' ? '#10b981' : '#ef4444',
            fontSize: 12, fontFamily: 'JetBrains Mono, monospace',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          }}>
            {toast.type === 'success' ? '[OK] ' : '[!] '}{toast.message}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#e2e8f0', fontFamily: 'JetBrains Mono, monospace', margin: 0 }}>
              SETTINGS
            </h1>
            <p style={{ color: '#64748b', fontSize: 13, marginTop: 8, fontFamily: 'JetBrains Mono, monospace' }}>
              Security policy and detection engine configuration
            </p>
          </div>
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
                style={inputStyle} />
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
                style={inputStyle} />
            </div>
          </div>

          {/* API Keys */}
          <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 8, padding: 24 }}>
            <h3 style={{ fontSize: 12, color: '#64748b', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', marginTop: 0, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #1e293b' }}>
              API KEYS
            </h3>
            {apiKeys.map((apiKey, i) => (
              <div key={i} style={{ padding: '12px 0', borderBottom: '1px solid #1e293b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#e2e8f0', fontFamily: 'JetBrains Mono, monospace', fontWeight: 500 }}>{apiKey.name}</div>
                    <div style={{ fontSize: 10, color: '#475569', fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>Created {apiKey.created}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button style={{
                      padding: '4px 10px', border: '1px solid #1e293b', borderRadius: 4, background: '#0f172a',
                      color: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono, monospace', cursor: 'pointer',
                    }} onClick={() => { navigator.clipboard.writeText(apiKey.key); showToast('Key copied to clipboard'); }}>COPY</button>
                    <button style={{
                      padding: '4px 10px', border: '1px solid #ef444440', borderRadius: 4, background: 'transparent',
                      color: '#ef4444', fontSize: 10, fontFamily: 'JetBrains Mono, monospace', cursor: 'pointer',
                    }} onClick={() => handleDeleteKey(i)}>REVOKE</button>
                  </div>
                </div>
                <div style={{ marginTop: 8, padding: '8px 10px', background: '#0f172a', borderRadius: 4, border: '1px solid #1e293b' }}>
                  <code style={{ fontSize: 11, color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>{apiKey.key.slice(0, 8)}...{apiKey.key.slice(-6)}</code>
                </div>
              </div>
            ))}
            <button style={{
              width: '100%', marginTop: 16, padding: '10px', border: '1px dashed #334155', borderRadius: 4,
              background: 'transparent', color: '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', cursor: 'pointer',
            }} onClick={handleGenerateKey}>+ GENERATE NEW KEY</button>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', maxWidth: 1200 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            {/* Account Info */}
            {user && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 16px', background: '#111827', border: '1px solid #1e293b', borderRadius: 6,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', background: '#1e293b',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: '#3b82f6', fontFamily: 'JetBrains Mono, monospace',
                }}>
                  {(user.email || user.username || '?')[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#e2e8f0', fontFamily: 'JetBrains Mono, monospace' }}>{user.username || user.email}</div>
                  <div style={{ fontSize: 9, color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>{user.email}</div>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              style={{
                padding: '10px 20px', border: '1px solid #ef444440', borderRadius: 4, background: 'transparent',
                color: '#ef4444', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', cursor: 'pointer',
                letterSpacing: '0.1em', fontWeight: 600,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#ef444415'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >LOGOUT</button>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => setShowResetConfirm(true)}
              style={{
                padding: '10px 24px', border: '1px solid #1e293b', borderRadius: 4, background: '#0f172a',
                color: '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', cursor: 'pointer', letterSpacing: '0.1em',
              }}
            >RESET DEFAULTS</button>
            <button
              onClick={handleSave}
              style={{
                padding: '10px 24px', border: 'none', borderRadius: 4,
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                color: '#fff', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', cursor: 'pointer',
                letterSpacing: '0.1em', fontWeight: 600, boxShadow: '0 0 15px rgba(59, 130, 246, 0.3)',
              }}
            >SAVE CONFIGURATION</button>
          </div>
        </div>

        {/* Reset Confirmation Modal */}
        {showResetConfirm && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          }} onClick={() => setShowResetConfirm(false)}>
            <div style={{
              background: '#111827', border: '1px solid #1e293b', borderRadius: 8, padding: 28,
              maxWidth: 400, width: '100%',
            }} onClick={e => e.stopPropagation()}>
              <h3 style={{ fontSize: 16, color: '#e2e8f0', fontFamily: 'JetBrains Mono, monospace', margin: '0 0 12px' }}>Reset to Defaults?</h3>
              <p style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace', margin: '0 0 20px', lineHeight: 1.6 }}>
                This will reset all settings to their default values. API keys will not be affected.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setShowResetConfirm(false)} style={{
                  flex: 1, padding: '10px', border: '1px solid #1e293b', borderRadius: 4, background: '#0f172a',
                  color: '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', cursor: 'pointer',
                }}>CANCEL</button>
                <button onClick={handleReset} style={{
                  flex: 1, padding: '10px', border: 'none', borderRadius: 4, background: '#ef4444',
                  color: '#fff', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', cursor: 'pointer', fontWeight: 600,
                }}>RESET</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
