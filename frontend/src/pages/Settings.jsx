/**
 * BlackNode Sentinel — Settings
 * Security policy configuration
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar';

const Settings = () => {
  const { apiClient, user } = useAuth();
  const [settings, setSettings] = useState({
    otxApiKey: '',
    scanEnabled: true,
    blockMode: true,
    alertEmail: '',
    mlEnabled: true,
    autoBlock: true,
    scanInterval: '3600',
    maxSeverity: 'high',
    ipWhitelist: '',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await apiClient.get('/settings');
        if (res.data.data) setSettings({ ...settings, ...res.data.data });
      } catch (err) {
        console.error('Settings not configured yet, using defaults');
      }
    };
    fetchSettings();
  }, [apiClient]);

  const handleSave = async () => {
    try {
      await apiClient.put('/settings', settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const ToggleSwitch = ({ checked, onChange, label, description }) => (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '12px 0', borderBottom: '1px solid var(--border-primary)',
    }}>
      <div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
          {label}
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
          {description}
        </div>
      </div>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 36, height: 20, borderRadius: 10, cursor: 'pointer',
          background: checked ? 'var(--accent-green)' : 'var(--bg-primary)',
          border: `1px solid ${checked ? 'var(--accent-green)' : 'var(--border-active)'}`,
          position: 'relative', transition: 'all 0.2s',
        }}
      >
        <div style={{
          width: 16, height: 16, borderRadius: '50%',
          background: checked ? '#fff' : 'var(--text-muted)',
          position: 'absolute', top: 1, left: checked ? 17 : 1,
          transition: 'all 0.2s',
        }} />
      </div>
    </div>
  );

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
            }}>S</span>
            Security Configuration
          </h1>
          <button className="btn-primary" onClick={handleSave}>
            {saved ? 'SAVED' : 'SAVE CHANGES'}
          </button>
        </div>

        <div className="grid-2">
          {/* Detection Settings */}
          <div className="card">
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16,
            }}>
              DETECTION ENGINE
            </div>

            <ToggleSwitch
              checked={settings.scanEnabled}
              onChange={(v) => setSettings({ ...settings, scanEnabled: v })}
              label="Vulnerability Scanning"
              description="Enable automated vulnerability scans on registered applications"
            />
            <ToggleSwitch
              checked={settings.mlEnabled}
              onChange={(v) => setSettings({ ...settings, mlEnabled: v })}
              label="ML-Based Detection"
              description="Use machine learning models for anomaly detection"
            />
            <ToggleSwitch
              checked={settings.autoBlock}
              onChange={(v) => setSettings({ ...settings, autoBlock: v })}
              label="Auto-Block"
              description="Automatically block detected threats without manual approval"
            />

            <div style={{ marginTop: 16 }}>
              <label style={{
                display: 'block', fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase',
                letterSpacing: 1, marginBottom: 6,
              }}>SCAN INTERVAL (seconds)</label>
              <input
                type="number"
                className="input-field"
                value={settings.scanInterval}
                onChange={(e) => setSettings({ ...settings, scanInterval: e.target.value })}
                min="300"
                max="86400"
              />
            </div>

            <div style={{ marginTop: 16 }}>
              <label style={{
                display: 'block', fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase',
                letterSpacing: 1, marginBottom: 6,
              }}>AUTO-BLOCK THRESHOLD</label>
              <select
                className="input-field"
                value={settings.maxSeverity}
                onChange={(e) => setSettings({ ...settings, maxSeverity: e.target.value })}
              >
                <option value="critical">Critical Only</option>
                <option value="high">High and above</option>
                <option value="medium">Medium and above</option>
                <option value="low">All severity levels</option>
              </select>
            </div>
          </div>

          {/* Integration Settings */}
          <div className="card">
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16,
            }}>
              INTEGRATIONS
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: 'block', fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase',
                letterSpacing: 1, marginBottom: 6,
              }}>OTX API KEY</label>
              <input
                type="password"
                className="input-field"
                value={settings.otxApiKey}
                onChange={(e) => setSettings({ ...settings, otxApiKey: e.target.value })}
                placeholder="AlienVault OTX API key"
              />
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                Required for real-time OTX threat intelligence feeds
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: 'block', fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase',
                letterSpacing: 1, marginBottom: 6,
              }}>ALERT EMAIL</label>
              <input
                type="email"
                className="input-field"
                value={settings.alertEmail}
                onChange={(e) => setSettings({ ...settings, alertEmail: e.target.value })}
                placeholder="security@yourcompany.com"
              />
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                Receives critical threat notifications
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: 'block', fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase',
                letterSpacing: 1, marginBottom: 6,
              }}>IP WHITELIST</label>
              <textarea
                className="input-field"
                value={settings.ipWhitelist}
                onChange={(e) => setSettings({ ...settings, ipWhitelist: e.target.value })}
                placeholder="One IP per line: 10.0.0.0/8, 192.168.0.0/16"
                rows={4}
                style={{ resize: 'vertical' }}
              />
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                IPs that bypass threat detection
              </div>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="card" style={{ marginTop: 24 }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16,
          }}>
            OPERATOR ACCOUNT
          </div>
          <div className="grid-3">
            {[
              { label: 'USERNAME', value: user?.username || 'N/A' },
              { label: 'EMAIL', value: user?.email || 'N/A' },
              { label: 'ROLE', value: user?.role || 'operator' },
            ].map((item) => (
              <div key={item.label}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                  {item.label}
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: 'var(--text-primary)' }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
