/**
 * BlackNode Sentinel — Navigation Sidebar
 */
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const links = [
  { to: '/dashboard', label: 'DASHBOARD', abbr: 'D' },
  { to: '/applications', label: 'APPLICATIONS', abbr: 'A' },
  { to: '/events', label: 'EVENTS', abbr: 'E' },
  { to: '/threat-intel', label: 'THREAT INTEL', abbr: 'T' },
  { to: '/network', label: 'NETWORK', abbr: 'N' },
  { to: '/settings', label: 'SETTINGS', abbr: 'S' },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{
      width: 220,
      background: '#0d1117',
      borderRight: '1px solid #1e293b',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 6,
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)',
          }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 14, fontFamily: 'JetBrains Mono, monospace' }}>BN</span>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em' }}>BLACKNODE</div>
            <div style={{ fontSize: 9, color: '#64748b', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.15em' }}>SENTINEL</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 8px' }}>
        {links.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <Link key={link.to} to={link.to} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              marginBottom: 2,
              borderRadius: 6,
              textDecoration: 'none',
              background: isActive ? '#1e293b' : 'transparent',
              color: isActive ? '#e2e8f0' : '#64748b',
              fontSize: 11,
              fontFamily: 'JetBrains Mono, monospace',
              letterSpacing: '0.1em',
              fontWeight: isActive ? 600 : 400,
              transition: 'all 0.15s',
            }}>
              <span style={{
                width: 26, height: 26, borderRadius: 4,
                background: isActive ? '#3b82f6' : '#1e293b',
                color: isActive ? '#fff' : '#64748b',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700,
                transition: 'all 0.15s',
              }}>{link.abbr}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
          <span style={{ fontSize: 10, color: '#64748b', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em' }}>SYSTEM OPERATIONAL</span>
        </div>
        {user && (
          <div style={{ fontSize: 10, color: '#475569', fontFamily: 'JetBrains Mono, monospace', marginBottom: 8, letterSpacing: '0.05em' }}>
            {user.email || user.username}
          </div>
        )}
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '8px 0',
            background: 'transparent',
            border: '1px solid #ef444440',
            borderRadius: 4,
            color: '#ef4444',
            fontSize: 10,
            fontFamily: 'JetBrains Mono, monospace',
            letterSpacing: '0.1em',
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#ef444415'; e.currentTarget.style.borderColor = '#ef4444'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#ef444440'; }}
        >
          LOGOUT
        </button>
      </div>
    </div>
  );
}
