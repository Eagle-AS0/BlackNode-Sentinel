/**
 * BlackNode Sentinel — Shared Animation Utilities (anime.js)
 */
import anime from 'animejs/lib/anime.es.js';

/* ── Page Enter Animation ────────────────────────────────── */
export const pageEnter = (containerRef) => {
  if (!containerRef?.current) return;
  anime({
    targets: containerRef.current.querySelectorAll('[data-animate]'),
    opacity: [0, 1],
    translateY: [30, 0],
    scale: [0.96, 1],
    duration: 600,
    delay: anime.stagger(80, { start: 100 }),
    easing: 'easeOutCubic',
  });
};

/* ── Staggered Card Grid ────────────────────────────────── */
export const staggerCards = (selector, container) => {
  const el = container || document;
  anime({
    targets: el.querySelectorAll(selector),
    opacity: [0, 1],
    translateY: [40, 0],
    scale: [0.92, 1],
    duration: 500,
    delay: anime.stagger(60, { start: 200 }),
    easing: 'easeOutBack',
  });
};

/* ── Stat Counter Roll-Up ───────────────────────────────── */
export const countUp = (el, target, duration = 1200) => {
  const obj = { val: 0 };
  anime({
    targets: obj,
    val: target,
    duration,
    round: 1,
    easing: 'easeOutExpo',
    update: () => { if (el) el.textContent = obj.val; },
  });
};

/* ── Neon Pulse Glow ────────────────────────────────────── */
export const neonPulse = (el) => {
  anime({
    targets: el,
    boxShadow: [
      '0 0 5px #00ff4144',
      '0 0 20px #00ff4166, 0 0 40px #00ff4133',
      '0 0 5px #00ff4144',
    ],
    duration: 2000,
    loop: true,
    easing: 'easeInOutSine',
  });
};

/* ── Logo Shield Spin-In ────────────────────────────────── */
export const shieldReveal = (el) => {
  anime({
    targets: el,
    scale: [0, 1.15, 1],
    rotate: ['-15deg', '5deg', '0deg'],
    opacity: [0, 1],
    duration: 800,
    easing: 'easeOutElastic(1, .6)',
  });
};

/* ── Typing Cursor Blink ────────────────────────────────── */
export const cursorBlink = (el) => {
  anime({
    targets: el,
    opacity: [1, 0],
    duration: 530,
    loop: true,
    direction: 'alternate',
    easing: 'steps(1)',
  });
};

/* ── Button Ripple ──────────────────────────────────────── */
export const buttonRipple = (e) => {
  const btn = e.currentTarget;
  const ripple = document.createElement('span');
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 2;
  Object.assign(ripple.style, {
    position: 'absolute',
    width: `${size}px`,
    height: `${size}px`,
    left: `${e.clientX - rect.left - size / 2}px`,
    top: `${e.clientY - rect.top - size / 2}px`,
    background: 'radial-gradient(circle, rgba(0,255,65,0.3) 0%, transparent 70%)',
    borderRadius: '50%',
    pointerEvents: 'none',
    transform: 'scale(0)',
  });
  btn.appendChild(ripple);
  anime({
    targets: ripple,
    scale: [0, 1],
    opacity: [1, 0],
    duration: 600,
    easing: 'easeOutCubic',
    complete: () => ripple.remove(),
  });
};

/* ── Table Row Slide-In ─────────────────────────────────── */
export const tableRows = (rows) => {
  anime({
    targets: rows,
    opacity: [0, 1],
    translateX: [-20, 0],
    duration: 350,
    delay: anime.stagger(30),
    easing: 'easeOutCubic',
  });
};

/* ── Scan Line Sweep ────────────────────────────────────── */
export const scanLine = (el) => {
  anime({
    targets: el,
    top: ['-4px', '100%'],
    duration: 4000,
    loop: true,
    easing: 'linear',
  });
};

/* ── Notification Pop-In ────────────────────────────────── */
export const popIn = (el) => {
  anime({
    targets: el,
    scale: [0.5, 1.1, 1],
    opacity: [0, 1],
    duration: 400,
    easing: 'easeOutBack',
  });
};

/* ── Status Dot Pulse ───────────────────────────────────── */
export const statusPulse = (el) => {
  anime({
    targets: el,
    boxShadow: [
      '0 0 4px currentColor',
      '0 0 12px currentColor, 0 0 24px currentColor',
      '0 0 4px currentColor',
    ],
    duration: 1500,
    loop: true,
    easing: 'easeInOutSine',
  });
};

/* ── Matrix Rain Column ─────────────────────────────────── */
export const matrixFall = (el, speed = 8) => {
  anime({
    targets: el,
    translateY: ['-100%', '200vh'],
    duration: speed * 1000,
    loop: true,
    easing: 'linear',
  });
};

/* ── Bar Chart Grow ─────────────────────────────────────── */
export const barGrow = (bars) => {
  anime({
    targets: bars,
    scaleY: [0, 1],
    opacity: [0, 1],
    duration: 800,
    delay: anime.stagger(100),
    easing: 'easeOutElastic(1, .5)',
  });
};
