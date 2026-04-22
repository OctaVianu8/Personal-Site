import { useEffect, useRef, useState } from "react";

const BG = "#050508";
const BLUE = "#3b82f6";
const FONT_DISPLAY = "'Bebas Neue', sans-serif";
const FONT_MONO = "'Space Mono', monospace";

const ENTRIES = [
  {
    role: "Software Engineering Intern",
    org: "AMIQ Eda",
    year: "2026 (upcoming)",
    desc: "Incoming SWE intern at AMIQ Eda, a leading provider of EDA solutions for the semiconductor industry.",
  },
  {
    role: "Discover Program",
    org: "Citadel",
    year: "2026",
    desc: "Selected for Citadel's exclusive program for top European CS students.",
  },
  {
    role: "Problem Setter",
    org: "CEOI",
    year: "2025",
    desc: "Designed and validated competition problems for the Central European Olympiad in Informatics.",
  },
] as const;

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

export default function Experience() {
  const { ref, fadeStyle } = useFadeIn();

  return (
    <section id="experience" style={{ background: BG }}>
      <div
        ref={ref}
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "6rem 2.5rem",
          ...fadeStyle,
        }}
      >
        <h2
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: "clamp(2.2rem, 4vw, 3rem)",
            color: "#fff",
            letterSpacing: "0.06em",
            marginBottom: "3.5rem",
          }}
        >
          EXPERIENCE
        </h2>

        <div style={{ position: "relative" }}>
          {/* Vertical timeline line */}
          <div
            style={{
              position: "absolute",
              left: "0.4375rem",
              top: "0.6rem",
              bottom: "0.5rem",
              width: "1px",
              background: "rgba(59,130,246,0.22)",
            }}
          />

          {ENTRIES.map((entry, i) => (
            <div
              key={i}
              style={{
                position: "relative",
                paddingLeft: "2.75rem",
                marginBottom: i < ENTRIES.length - 1 ? "3.5rem" : 0,
              }}
            >
              {/* Dot */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: "0.35rem",
                  width: "0.875rem",
                  height: "0.875rem",
                  borderRadius: "50%",
                  background: BLUE,
                  boxShadow: `0 0 10px rgba(59,130,246,0.55)`,
                }}
              />

              <h3
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: "clamp(1.2rem, 2.5vw, 1.55rem)",
                  color: "#fff",
                  letterSpacing: "0.05em",
                  marginBottom: "0.4rem",
                  lineHeight: 1,
                }}
              >
                {entry.role}
              </h3>

              <p
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: "0.7rem",
                  color: "rgba(255,255,255,0.38)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: "0.75rem",
                }}
              >
                {entry.org}&nbsp;&nbsp;·&nbsp;&nbsp;{entry.year}
              </p>

              <p
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: "0.78rem",
                  color: "rgba(255,255,255,0.62)",
                  lineHeight: "1.75",
                  letterSpacing: "0.01em",
                }}
              >
                {entry.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
