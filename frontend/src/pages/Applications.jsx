/**
 * BlackNode Sentinel — Applications
 * Enterprise application monitoring registry
 */
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import anime from 'animejs/lib/anime.es.js';

const Applications = () => {
  const { apiClient } = useAuth();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [installApp, setInstallApp] = useState(null);
  const [form, setForm] = useState({ name: '', url: '', description: '', language: 'javascript', framework: 'Express', environment: 'production' });
  const cardsRef = useRef(null);

  const fetchApps = useCallback(async () => {
    try {
      const res = await apiClient.get('/applications');
      setApps(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  useEffect(() => {
    if (!loading && cardsRef.current) {
      anime({
        targets: cardsRef.current.querySelectorAll('.app-card'),
        opacity: [0, 1],
        translateY: [15, 0],
        duration: 300,
        delay: anime.stagger(60),
        easing: 'easeOutCubic',
      });
    }
  }, [loading, apps]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await apiClient.post('/applications', form);
      setApps([...apps, res.data.data]);
      setShowModal(false);
      setForm({ name: '', url: '', description: '', language: 'javascript', framework: 'Express', environment: 'production' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this application from monitoring?')) return;
    try {
      await apiClient.delete(`/applications/${id}`);
      setApps(apps.filter(a => a._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const agentCode = (key) => `// Install: npm install blacknode-agent
const BlackNodeAgent = require('blacknode-agent');

const agent = new BlackNodeAgent({
  serverUrl: 'http://YOUR_DASHBOARD:5004',
  agentKey: '${key}',
  appUrl: 'http://YOUR_APP_URL',
});

app.use(agent.middleware());`;

  return (
    <>
      <Navbar />
      <div className="main-content">
        <div className="page-header">
          <h1>
            <span style={{
              width: 28, height: 28, borderRadius: 6,
              background: 'rgba(0, 188, 212, 0.1)',
              border: '1px solid rgba(0, 188, 212, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: 'var(--accent-cyan)',
            }}>A</span>
            Monitored Applications
          </h1>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            + Register Application
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div className="spinner" />
          </div>
        ) : apps.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
              No applications registered
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-muted)', marginBottom: 20 }}>
              Register your first application to begin runtime protection monitoring.
            </div>
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              + Register Application
            </button>
          </div>
        ) : (
          <div ref={cardsRef} className="grid-2">
            {apps.map((app) => (
              <div key={app._id} className="card app-card" style={{ opacity: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <div style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4,
                    }}>
                      {app.name}
                    </div>
                    <div style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 11, color: 'var(--text-muted)',
                    }}>
                      {app.url}
                    </div>
                  </div>
                  <div className="status-dot online" />
                </div>

                {app.description && (
                  <div style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5,
                  }}>
                    {app.description}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                  {[
                    { label: 'LANG', value: app.language },
                    { label: 'FRAMEWORK', value: app.framework },
                    { label: 'ENV', value: app.environment },
                  ].map((tag) => (
                    <span key={tag.label} style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 10, color: 'var(--text-muted)',
                      padding: '3px 8px', background: 'var(--bg-primary)',
                      border: '1px solid var(--border-primary)', borderRadius: 3,
                    }}>
                      {tag.label}: <span style={{ color: 'var(--text-secondary)' }}>{tag.value}</span>
                    </span>
                  ))}
                </div>

                {app.agentKey && (
                  <div style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10, color: 'var(--text-muted)', marginBottom: 12,
                    padding: '6px 10px', background: 'var(--bg-primary)',
                    border: '1px solid var(--border-primary)', borderRadius: 4,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <span>AGENT KEY</span>
                    <span style={{ color: 'var(--accent-green)', fontSize: 11 }}>
                      {app.agentKey.substring(0, 8)}...{app.agentKey.substring(app.agentKey.length - 4)}
                    </span>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button className="btn-secondary" onClick={() => setInstallApp(installApp?._id === app._id ? null : app)}>
                    Install Agent
                  </button>
                  <button className="btn-danger" onClick={() => handleDelete(app._id)}>
                    Remove
                  </button>
                </div>

                {installApp?._id === app._id && app.agentKey && (
                  <div style={{
                    marginTop: 16, padding: 14,
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: 4,
                  }}>
                    <div style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 10, fontWeight: 600, color: 'var(--text-muted)',
                      textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10,
                    }}>
                      INSTALLATION INSTRUCTIONS
                    </div>
                    <pre style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 11, color: 'var(--accent-green)',
                      whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                      lineHeight: 1.6, margin: 0,
                    }}>
                      {agentCode(app.agentKey)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showModal && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          }} onClick={() => setShowModal(false)}>
            <div style={{
              width: 440, background: 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)', borderRadius: 6, padding: 24,
            }} onClick={(e) => e.stopPropagation()}>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
                marginBottom: 20, paddingBottom: 12,
                borderBottom: '1px solid var(--border-primary)',
              }}>
                REGISTER APPLICATION
              </div>
              <form onSubmit={handleCreate}>
                {[
                  { label: 'APPLICATION NAME', key: 'name', placeholder: 'e.g. Production API Gateway' },
                  { label: 'URL', key: 'url', placeholder: 'https://api.yourapp.com' },
                  { label: 'DESCRIPTION', key: 'description', placeholder: 'Brief description of the application' },
                ].map((f) => (
                  <div key={f.key} style={{ marginBottom: 14 }}>
                    <label style={{
                      display: 'block', fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase',
                      letterSpacing: 1, marginBottom: 5,
                    }}>{f.label}</label>
                    <input
                      className="input-field"
                      value={form[f.key]}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      placeholder={f.placeholder}
                      required
                    />
                  </div>
                ))}
                <div className="grid-3" style={{ marginBottom: 20 }}>
                  {[
                    { label: 'LANGUAGE', key: 'language', options: ['javascript', 'python', 'java', 'go', 'ruby', 'php'] },
                    { label: 'FRAMEWORK', key: 'framework', options: ['Express', 'FastAPI', 'Django', 'Flask', 'Spring', 'Rails', 'Laravel', 'Gin'] },
                    { label: 'ENVIRONMENT', key: 'environment', options: ['production', 'staging', 'development'] },
                  ].map((f) => (
                    <div key={f.key}>
                      <label style={{
                        display: 'block', fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase',
                        letterSpacing: 1, marginBottom: 5,
                      }}>{f.label}</label>
                      <select
                        className="input-field"
                        value={form[f.key]}
                        onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      >
                        {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Register</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Applications;
