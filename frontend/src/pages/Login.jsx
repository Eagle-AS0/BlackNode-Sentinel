/**
 * BlackNode Sentinel — Login
 * Professional authentication interface
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import anime from 'animejs/lib/anime.es.js';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      anime({
        targets: containerRef.current,
        opacity: [0, 1],
        duration: 500,
        easing: 'easeOutCubic',
      });
    }
    if (formRef.current) {
      anime({
        targets: formRef.current.children,
        opacity: [0, 1],
        translateY: [15, 0],
        duration: 350,
        delay: anime.stagger(50, { start: 200 }),
        easing: 'easeOutCubic',
      });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    if (!result.success) {
      setError(result.error || 'Authentication failed');
      setLoading(false);
      anime({
        targets: formRef.current,
        translateX: [0, -6, 6, -4, 4, 0],
        duration: 400,
        easing: 'easeInOutCubic',
      });
      return;
    }
    anime({
      targets: containerRef.current,
      opacity: [1, 0],
      scale: [1, 0.98],
      duration: 250,
      easing: 'easeInCubic',
      complete: () => navigate('/dashboard'),
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Grid background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(0, 230, 118, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 230, 118, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
      }} />

      <div ref={containerRef} style={{ opacity: 0, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 8,
            border: '1px solid var(--accent-green)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            background: 'rgba(0, 230, 118, 0.05)',
          }}>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 20,
              fontWeight: 700,
              color: 'var(--accent-green)',
            }}>B</span>
          </div>
          <h1 style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}>
            <span style={{ color: 'var(--accent-green)' }}>BLACK</span>NODE SENTINEL
          </h1>
          <p style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            color: 'var(--text-muted)',
            marginTop: 6,
            letterSpacing: 1,
          }}>
            RUNTIME APPLICATION PROTECTION
          </p>
        </div>

        {/* Form */}
        <div ref={formRef} style={{
          width: 380,
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
          borderRadius: 6,
          padding: '28px 28px 24px',
        }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: 20,
            paddingBottom: 12,
            borderBottom: '1px solid var(--border-primary)',
          }}>
            AUTHENTICATE
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: 'block',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                fontWeight: 500,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: 1,
                marginBottom: 6,
              }}>
                EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="operator@blacknode.io"
                required
                autoFocus
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: 'block',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                fontWeight: 500,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: 1,
                marginBottom: 6,
              }}>
                PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Enter credentials"
                required
              />
            </div>

            {error && (
              <div style={{
                padding: '10px 12px',
                background: 'rgba(255, 23, 68, 0.08)',
                border: '1px solid rgba(255, 23, 68, 0.2)',
                borderRadius: 4,
                marginBottom: 16,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                color: 'var(--accent-red)',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px 0',
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                  Authenticating...
                </>
              ) : (
                'LOGIN'
              )}
            </button>
          </form>

          <div style={{
            marginTop: 16,
            textAlign: 'center',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            color: 'var(--text-muted)',
          }}>
            No account?{' '}
            <Link to="/register" style={{
              color: 'var(--accent-cyan)',
              textDecoration: 'none',
            }}>
              Register operator
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: 24,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          color: 'var(--text-muted)',
          letterSpacing: 0.5,
        }}>
          BLACKNODE SENTINEL // SECURITY OPERATIONS CENTER
        </div>
      </div>
    </div>
  );
};

export default Login;
