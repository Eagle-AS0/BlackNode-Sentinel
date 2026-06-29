/**
 * BlackNode Sentinel — Animated Shield Logo
 * Uses anime.js for a cinematic reveal effect.
 */
import React, { useRef, useEffect } from 'react';
import { shieldReveal, neonPulse } from '../utils/animations';

const AnimatedLogo = ({ size = 48, showText = true, className = '' }) => {
  const shieldRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    if (shieldRef.current) {
      shieldReveal(shieldRef.current);
      neonPulse(shieldRef.current);
    }
    if (textRef.current) {
      const els = textRef.current.querySelectorAll('.anim-letter');
      if (els.length) {
        const anime = require('animejs/lib/anime.es.js').default;
        anime({
          targets: els,
          opacity: [0, 1],
          translateY: [20, 0],
          rotateX: [-90, 0],
          duration: 500,
          delay: anime.stagger(40, { start: 400 }),
          easing: 'easeOutCubic',
        });
      }
    }
  }, []);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        ref={shieldRef}
        style={{
          fontSize: size,
          filter: 'drop-shadow(0 0 12px #00ff4166)',
          opacity: 0,
          lineHeight: 1,
        }}
      >
        🛡️
      </div>
      {showText && (
        <div ref={textRef}>
          <div
            style={{
              fontFamily: "'Fira Code', monospace",
              fontSize: Math.max(14, size * 0.35),
              fontWeight: 700,
              color: '#00ff41',
              textShadow: '0 0 10px #00ff4144',
              letterSpacing: '2px',
              display: 'flex',
            }}
          >
            {'BLACKNODE'.split('').map((ch, i) => (
              <span key={i} className="anim-letter" style={{ opacity: 0 }}>
                {ch}
              </span>
            ))}
          </div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: Math.max(9, size * 0.2),
              color: '#00d4ff',
              textShadow: '0 0 6px #00d4ff44',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              display: 'flex',
            }}
          >
            {'SENTINEL'.split('').map((ch, i) => (
              <span key={i} className="anim-letter" style={{ opacity: 0 }}>
                {ch}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnimatedLogo;
