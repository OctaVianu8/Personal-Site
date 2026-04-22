import { useEffect, useRef, useState } from "react";

const BG = "#050508";
const BLUE = "#3b82f6";
const FONT_DISPLAY = "'Bebas Neue', sans-serif";
const FONT_MONO = "'Space Mono', monospace";

function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return {
    ref,
    fadeStyle: {
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(22px)",
      transition: "opacity 0.7s ease, transform 0.7s ease",
    },
  };
}

export default function About() {
  const { ref, fadeStyle } = useFadeIn();

  return (
    <section id="about" style={{ background: BG }}>
      <div
        ref={ref}
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "7rem 2.5rem 6rem",
          ...fadeStyle,
        }}
      >
        <h2
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: "clamp(2.2rem, 4vw, 3rem)",
            color: "#fff",
            letterSpacing: "0.06em",
            marginBottom: "2.5rem",
          }}
        >
          ABOUT
        </h2>

        <div
          style={{
            borderLeft: `2px solid ${BLUE}`,
            paddingLeft: "2rem",
            marginBottom: "4rem",
          }}
        >
          <p
            style={{
              fontFamily: FONT_MONO,
              fontSize: "clamp(0.78rem, 1.3vw, 0.88rem)",
              lineHeight: "2",
              color: "rgba(255,255,255,0.72)",
              letterSpacing: "0.015em",
            }}
          >
            I'm a CS student at UPB Bucharest, competitive programmer, and incoming
            intern. I placed Gold at ONI 2024 (Romanian National Informatics Olympiad)
            and serve as a problem setter for CEOI (Central European Olympiad in
            Informatics). I was selected for the Citadel Discover program. I care about
            algorithms, systems, and building things that work.
          </p>
        </div>

        <hr
          style={{
            border: "none",
            borderTop: "1px solid rgba(255,255,255,0.07)",
          }}
        />
      </div>
    </section>
  );
}
