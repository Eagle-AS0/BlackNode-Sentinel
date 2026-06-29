/**
 * BlackNode Sentinel — Professional Navigation Sidebar
 */
import React, { useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import anime from 'animejs/lib/anime.es.js';

const navItems = [
  { section: 'SECURITY' },
  { path: '/dashboard', label: 'Dashboard', icon: 'D' },
  { path: '/threat-intel', label: 'Threat Intel', icon: 'T' },
  { path: '/applications', label: 'Applications', icon: 'A' },
  { path: '/events', label: 'Events', icon: 'E' },
  { section: 'INFRASTRUCTURE' },
  { path: '/network', label: 'Network', icon: 'N' },
  { section: 'SYSTEM' },
  { path: '/settings', label: 'Settings', icon: 'S' },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const navRef = useRef(null);

  useEffect(() => {
    if (navRef.current) {
      anime({
        targets: navRef.current.querySelectorAll('.nav-link'),
        opacity: [0, 1],
        translateX: [-10, 0],
        duration: 250,
        delay: anime.stagger(30),
        easing: 'easeOutCubic',
      });
    }
  }, []);

  const handleLogout = () => {
    anime({
      targets: '.sidebar',
      opacity: [1, 0],
      x: [-10, -20],
      duration: 300,
      easing: 'easeInCubic',
      complete: () => {
        logout();
        navigate('/login');
      },
    });
  };

  return (
    <aside className="sidebar" ref={navRef}>
      <div className="sidebar-brand">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h1>
            <span className="brand-accent">BLACK</span>NODE
          </h1>
          <span className="brand-version">SENTINEL v2.1.0</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item, i) => {
          if (item.section) {
            return <div key={i} className="nav-section">{item.section}</div>;
          }
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {isActive && (
                <div style={{
                  position: 'absolute',
                  right: 12,
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: 'var(--accent-green)',
                  boxShadow: '0 0 6px var(--accent-green)',
                }} />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        {user && (
          <div style={{
            marginBottom: 10,
            padding: '8px 0',
            borderTop: '1px solid var(--border-primary)',
          }}>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: 'var(--text-muted)',
              marginBottom: 2,
            }}>
              AUTHENTICATED AS
            </div>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              color: 'var(--text-secondary)',
              fontWeight: 500,
            }}>
              {user.username || user.email}
            </div>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              color: 'var(--text-muted)',
              marginTop: 2,
            }}>
              {user.role || 'operator'}
            </div>
          </div>
        )}
        <button className="nav-link logout" onClick={handleLogout} style={{ width: '100%', cursor: 'pointer', background: 'none', border: 'none', textAlign: 'left', fontFamily: 'inherit' }}>
          <span className="nav-icon">X</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Navbar;
