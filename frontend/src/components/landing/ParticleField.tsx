import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
  phase: number;
}

const MAX_PARTICLES = 80;
const LINK_DISTANCE = 120;

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isDarkMode() {
  return document.documentElement.classList.contains('dark') ||
    document.documentElement.getAttribute('data-theme') === 'dark';
}

export function ParticleField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const reduceMotion = prefersReducedMotion();
    let particles: Particle[] = [];
    let width = 0;
    let height = 0;
    let raf = 0;
    let last = performance.now();

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(Math.floor((width * height) / 22000), MAX_PARTICLES);
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() * 1.6 + 0.6,
        alpha: Math.random() * 0.5 + 0.15,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);
      const dark = isDarkMode();
      const dotColor = dark ? '190, 199, 255' : '37, 99, 235';
      const lineColor = dark ? '120, 140, 255' : '59, 130, 246';

      const dt = Math.min((time - last) / 1000, 0.05);
      last = time;

      for (const p of particles) {
        p.x += p.vx * dt * 60;
        p.y += p.vy * dt * 60;
        p.phase += 0.008;

        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        const twinkle = 0.55 + 0.45 * Math.sin(p.phase);
        context.beginPath();
        context.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        context.fillStyle = `rgba(${dotColor}, ${p.alpha * twinkle})`;
        context.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DISTANCE) {
            const opacity = (1 - dist / LINK_DISTANCE) * 0.12;
            context.beginPath();
            context.moveTo(a.x, a.y);
            context.lineTo(b.x, b.y);
            context.strokeStyle = `rgba(${lineColor}, ${opacity})`;
            context.lineWidth = 1;
            context.stroke();
          }
        }
      }
    };

    const loop = (time: number) => {
      draw(time);
      raf = requestAnimationFrame(loop);
    };

    resize();
    if (reduceMotion) {
      draw(performance.now());
    } else {
      raf = requestAnimationFrame(loop);
    }

    const observer = new ResizeObserver(resize);
    if (canvas.parentElement) observer.observe(canvas.parentElement);

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else if (!reduceMotion) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
