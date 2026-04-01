import { useEffect, useRef } from "react";
import "./Hero.css";

// ─────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────

const CANVAS_CONFIG = {
  dotCount: 60,
  dotRadius: 1.5,
  dotColor: "rgba(59,130,246,0.35)",
  connectionDistance: 120,
  connectionOpacity: 0.12,
  velocity: 0.3,
} as const;

const STATS = [
  { value: "Gold", label: "ONI 2024" },
  { value: "CEOI", label: "Problem Setter" },
  { value: "Citadel", label: "Discover" },
] as const;

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface Dot {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

// ─────────────────────────────────────────────────────────────
// Canvas Animation Hook
// ─────────────────────────────────────────────────────────────

function useDotsAnimation(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    const dots = createDots(canvas.width, canvas.height);
    let animationFrame: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      updateAndDrawDots(ctx, dots, canvas.width, canvas.height);
      drawConnections(ctx, dots);
      animationFrame = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", handleResize);
    };
  }, [canvasRef]);
}

function createDots(width: number, height: number): Dot[] {
  const { dotCount, velocity } = CANVAS_CONFIG;
  return Array.from({ length: dotCount }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * velocity,
    vy: (Math.random() - 0.5) * velocity,
  }));
}

function updateAndDrawDots(
  ctx: CanvasRenderingContext2D,
  dots: Dot[],
  width: number,
  height: number
) {
  const { dotRadius, dotColor } = CANVAS_CONFIG;

  for (const dot of dots) {
    dot.x += dot.vx;
    dot.y += dot.vy;

    if (dot.x < 0 || dot.x > width) dot.vx *= -1;
    if (dot.y < 0 || dot.y > height) dot.vy *= -1;

    ctx.beginPath();
    ctx.arc(dot.x, dot.y, dotRadius, 0, Math.PI * 2);
    ctx.fillStyle = dotColor;
    ctx.fill();
  }
}

function drawConnections(ctx: CanvasRenderingContext2D, dots: Dot[]) {
  const { connectionDistance, connectionOpacity } = CANVAS_CONFIG;

  for (let i = 0; i < dots.length; i++) {
    for (let j = i + 1; j < dots.length; j++) {
      const dx = dots[i].x - dots[j].x;
      const dy = dots[i].y - dots[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < connectionDistance) {
        const opacity = connectionOpacity * (1 - dist / connectionDistance);
        ctx.beginPath();
        ctx.moveTo(dots[i].x, dots[i].y);
        ctx.lineTo(dots[j].x, dots[j].y);
        ctx.strokeStyle = `rgba(59,130,246,${opacity})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

function HeroBackground({ canvasRef }: { canvasRef: React.RefObject<HTMLCanvasElement | null> }) {
  return (
    <>
      <canvas ref={canvasRef} className="hero__canvas" />
      <div className="hero__glow" />
    </>
  );
}

function HeroTitle() {
  return (
    <>
      <p className="hero__greeting">Hello, I'm</p>
      <h1 className="hero__title">
        Octavian
        <br />
        <span className="hero__title-accent">Stănescu</span>
      </h1>
      <p className="hero__subtitle">
        CSE @ UPB &nbsp;·&nbsp; Competitive Programmer
      </p>
    </>
  );
}

function HeroActions() {
  return (
    <div className="hero__actions">
      <a href="#projects" className="hero__btn-primary">
        View Projects
      </a>
      <a
        href="/CV.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className="hero__btn-secondary"
      >
        Download CV
      </a>
    </div>
  );
}

function HeroStats() {
  return (
    <div className="hero__stats">
      {STATS.map(({ value, label }) => (
        <div key={label}>
          <p className="hero__stat-value">{value}</p>
          <p className="hero__stat-label">{label}</p>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useDotsAnimation(canvasRef);

  return (
    <section className="hero">
      <HeroBackground canvasRef={canvasRef} />
      <div className="hero__content">
        <HeroTitle />
        <HeroActions />
        <HeroStats />
      </div>
    </section>
  );
}
