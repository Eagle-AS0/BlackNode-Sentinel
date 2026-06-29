/**
 * BlackNode Sentinel — Network
 * Infrastructure monitoring and node topology
 */
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import anime from 'animejs/lib/anime.es.js';

const Network = () => {
  const { apiClient } = useAuth();
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const nodesRef = useRef(null);

  const fetchNodes = useCallback(async () => {
    try {
      const res = await apiClient.get('/network');
      setNodes(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  useEffect(() => { fetchNodes(); }, [fetchNodes]);

  useEffect(() => {
    if (!loading && nodesRef.current) {
      anime({
        targets: nodesRef.current.querySelectorAll('.node-card'),
        opacity: [0, 1],
        scale: [0.95, 1],
        duration: 300,
        delay: anime.stagger(50),
        easing: 'easeOutCubic',
      });
    }
  }, [loading, nodes]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'online';
      case 'warning': return 'warning';
      case 'critical': return 'critical';
      default: return 'offline';
    }
  };

  return (
    <>
      <Navbar />
      <div className="main-content">
        <div className="page-header">
          <h1>
            <span style={{
              width: 28, height: 28, borderRadius: 6,
              background: 'rgba(68, 138, 255, 0.1)',
              border: '1px solid rgba(68, 138, 255, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: 'var(--accent-blue)',
            }}>N</span>
            Network Infrastructure
          </h1>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-muted)' }}>
            {nodes.length} nodes monitored
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div className="spinner" />
          </div>
        ) : nodes.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
              No network nodes configured
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-muted)' }}>
              Deploy BlackNode agents to your infrastructure nodes to begin network monitoring.
            </div>
          </div>
        ) : (
          <>
            {/* Network Overview Stats */}
            <div className="grid-4" style={{ marginBottom: 24 }}>
              <div className="card-stat">
                <div className="stat-label">TOTAL NODES</div>
                <div className="stat-value" style={{ fontSize: 24 }}>{nodes.length}</div>
              </div>
              <div className="card-stat">
                <div className="stat-label">ONLINE</div>
                <div className="stat-value" style={{ fontSize: 24, color: 'var(--accent-green)' }}>
                  {nodes.filter(n => n.status === 'online').length}
                </div>
              </div>
              <div className="card-stat">
                <div className="stat-label">WARNING</div>
                <div className="stat-value" style={{ fontSize: 24, color: 'var(--accent-orange)' }}>
                  {nodes.filter(n => n.status === 'warning').length}
                </div>
              </div>
              <div className="card-stat">
                <div className="stat-label">OFFLINE</div>
                <div className="stat-value" style={{ fontSize: 24, color: 'var(--text-muted)' }}>
                  {nodes.filter(n => n.status === 'offline').length}
                </div>
              </div>
            </div>

            {/* Node Grid */}
            <div ref={nodesRef} className="grid-3">
              {nodes.map((node) => (
                <div
                  key={node._id}
                  className="card node-card"
                  style={{
                    opacity: 0,
                    cursor: 'pointer',
                    borderColor: selectedNode?._id === node._id ? 'var(--accent-cyan)' : undefined,
                  }}
                  onClick={() => setSelectedNode(selectedNode?._id === node._id ? null : node)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
                    }}>
                      {node.name || node.hostname || 'Unknown Node'}
                    </div>
                    <div className={`status-dot ${getStatusColor(node.status)}`} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { label: 'IP', value: node.ip || node.ipAddress || 'N/A' },
                      { label: 'TYPE', value: node.type || node.nodeType || 'agent' },
                      { label: 'REGION', value: node.region || 'N/A' },
                    ].map((item) => (
                      <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase',
                        }}>{item.label}</span>
                        <span style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 11, color: 'var(--text-secondary)',
                        }}>{item.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Health Bar */}
                  <div style={{ marginTop: 12 }}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', marginBottom: 4,
                    }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--text-muted)' }}>
                        HEALTH
                      </span>
                      <span style={{
                        fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
                        color: node.health > 80 ? 'var(--accent-green)' : node.health > 50 ? 'var(--accent-orange)' : 'var(--accent-red)',
                      }}>
                        {node.health || 0}%
                      </span>
                    </div>
                    <div className="severity-bar">
                      <div
                        className="severity-bar-fill"
                        style={{
                          width: `${node.health || 0}%`,
                          background: node.health > 80 ? 'var(--accent-green)' : node.health > 50 ? 'var(--accent-orange)' : 'var(--accent-red)',
                        }}
                      />
                    </div>
                  </div>

                  {selectedNode?._id === node._id && (
                    <div style={{
                      marginTop: 12, paddingTop: 12,
                      borderTop: '1px solid var(--border-primary)',
                    }}>
                      <div style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 10, fontWeight: 600, color: 'var(--text-muted)',
                        textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8,
                      }}>NODE DETAILS</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {[
                          { label: 'UPTIME', value: node.uptime || 'N/A' },
                          { label: 'CPU', value: `${node.cpu || 0}%` },
                          { label: 'MEMORY', value: `${node.memory || 0}%` },
                          { label: 'LAST SEEN', value: node.lastSeen ? new Date(node.lastSeen).toLocaleString() : 'N/A' },
                        ].map((item) => (
                          <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--text-muted)' }}>{item.label}</span>
                            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-secondary)' }}>{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Network;
