/**
 * BlackNode Sentinel — Network
 * Infrastructure monitoring topology
 */
import React from 'react';
import Navbar from '../components/Navbar';
import { networkNodes } from '../data/realData';

const statusColors = { healthy: '#10b981', warning: '#eab308', critical: '#ef4444' };
const typeIcons = { gateway: 'GW', firewall: 'FW', server: 'SV', database: 'DB', cache: 'RC' };

export default function Network() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0e17' }}>
      <Navbar />
      <div style={{ flex: 1, padding: 32, overflow: 'auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#e2e8f0', fontFamily: 'JetBrains Mono, monospace', margin: 0 }}>
            NETWORK TOPOLOGY
          </h1>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 8, fontFamily: 'JetBrains Mono, monospace' }}>
            {networkNodes.length} nodes — {networkNodes.filter(n => n.status === 'healthy').length} healthy, {networkNodes.filter(n => n.status === 'warning').length} warning
          </p>
        </div>

        {/* Network Overview Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'TOTAL NODES', value: networkNodes.length, color: '#3b82f6' },
            { label: 'HEALTHY', value: networkNodes.filter(n => n.status === 'healthy').length, color: '#10b981' },
            { label: 'THREATS BLOCKED', value: networkNodes.reduce((s, n) => s + n.threats, 0).toLocaleString(), color: '#ef4444' },
            { label: 'TOTAL THROUGHPUT', value: '24.8 Gbps', color: '#8b5cf6' },
          ].map((item, i) => (
            <div key={i} style={{
              background: '#111827', border: '1px solid #1e293b', borderRadius: 8, padding: 20,
              borderLeft: `3px solid ${item.color}`,
            }}>
              <div style={{ fontSize: 10, color: '#64748b', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', marginBottom: 6 }}>{item.label}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: item.color, fontFamily: 'JetBrains Mono, monospace' }}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* Node Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {networkNodes.map((node) => (
            <div key={node.id} style={{
              background: 'linear-gradient(135deg, #111827 0%, #0f172a 100%)',
              border: '1px solid #1e293b',
              borderRadius: 8,
              padding: 20,
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Status Indicator */}
              <div style={{
                position: 'absolute', top: 0, right: 0,
                width: 60, height: 60, borderRadius: '0 0 0 60px',
                background: statusColors[node.status] + '10',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: statusColors[node.status],
                  boxShadow: `0 0 12px ${statusColors[node.status]}`,
                }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 6,
                  background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid #334155',
                }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#3b82f6', fontFamily: 'JetBrains Mono, monospace' }}>
                    {typeIcons[node.type] || node.type.toUpperCase().slice(0, 2)}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', fontFamily: 'JetBrains Mono, monospace' }}>{node.name}</div>
                  <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>{node.ip}</div>
                </div>
              </div>

              {/* Resource Bars */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 10, color: '#64748b', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em' }}>CPU</span>
                  <span style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace' }}>{node.cpu}%</span>
                </div>
                <div style={{ width: '100%', height: 4, background: '#1e293b', borderRadius: 2 }}>
                  <div style={{ width: node.cpu + '%', height: '100%', background: node.cpu > 80 ? '#ef4444' : node.cpu > 60 ? '#eab308' : '#10b981', borderRadius: 2 }} />
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 10, color: '#64748b', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em' }}>MEMORY</span>
                  <span style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace' }}>{node.memory}%</span>
                </div>
                <div style={{ width: '100%', height: 4, background: '#1e293b', borderRadius: 2 }}>
                  <div style={{ width: node.memory + '%', height: '100%', background: node.memory > 80 ? '#ef4444' : node.memory > 60 ? '#eab308' : '#10b981', borderRadius: 2 }} />
                </div>
              </div>

              {/* Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 12 }}>
                <div>
                  <div style={{ fontSize: 9, color: '#475569', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em' }}>NETWORK</div>
                  <div style={{ fontSize: 12, color: '#e2e8f0', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{node.network}</div>
                </div>
                <div>
                  <div style={{ fontSize: 9, color: '#475569', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em' }}>REQUESTS</div>
                  <div style={{ fontSize: 12, color: '#e2e8f0', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{node.requests}</div>
                </div>
                <div>
                  <div style={{ fontSize: 9, color: '#475569', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em' }}>UPTIME</div>
                  <div style={{ fontSize: 12, color: '#10b981', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{node.uptime}</div>
                </div>
              </div>

              {node.threats > 0 && (
                <div style={{ marginTop: 12, padding: '8px 12px', background: '#ef444410', border: '1px solid #ef444430', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }} />
                  <span style={{ fontSize: 10, color: '#ef4444', fontFamily: 'JetBrains Mono, monospace' }}>{node.threats} THREATS DETECTED</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
