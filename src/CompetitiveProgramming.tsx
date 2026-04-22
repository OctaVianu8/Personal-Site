import { useEffect, useRef, useState } from "react";

const BG = "#050508";
const BLUE = "#3b82f6";
const FONT_DISPLAY = "'Bebas Neue', sans-serif";
const FONT_MONO = "'Space Mono', monospace";

const ACHIEVEMENTS = [
  {
    emoji: "🥇",
    event: "ONI 2024",
    result: "Gold Medal",
    desc: "National Informatics Olympiad, Romania",
  },
  {
    emoji: "🥉",
    event: "RCPC 2024 and 2025",
    result: "Bronze Medal",
    desc: "Romanian Collegiate Programming Contest",
  },
  {
    emoji: "✍️",
    event: "CEOI 2025",
    result: "Problem Setter",
    desc: "Central European Olympiad in Informatics",
  },
] as const;

function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.08 });
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

export default function CompetitiveProgramming() {
  const { ref, fadeStyle } = useFadeIn();
  const [cardHovered, setCardHovered] = useState<number | null>(null);
  const [profileHovered, setProfileHovered] = useState(false);

  return (
    <section id="competitive-programming" style={{ background: BG }}>
      <div
        ref={ref}
        style={{
          maxWidth: "1100px",
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
            marginBottom: "3rem",
          }}
        >
          COMPETITIVE PROGRAMMING
        </h2>

        {/* Two-column layout */}
        <div
          style={{
            display: "flex",
            gap: "2.5rem",
            alignItems: "flex-start",
            flexWrap: "wrap",
            marginBottom: "3rem",
          }}
        >
          {/* Left: achievement cards */}
          <div style={{ flex: "1", minWidth: "260px", display: "flex", flexDirection: "column", gap: "1rem" }}>
            {ACHIEVEMENTS.map((a, i) => {
              const isHovered = cardHovered === i;
              return (
                <div
                  key={i}
                  onMouseEnter={() => setCardHovered(i)}
                  onMouseLeave={() => setCardHovered(null)}
                  style={{
                    background: isHovered ? "#08081a" : "#06060e",
                    border: `1px solid ${isHovered ? "rgba(59,130,246,0.45)" : "rgba(255,255,255,0.07)"}`,
                    borderRadius: "4px",
                    padding: "1.5rem 1.75rem",
                    transition: "background 0.2s ease, border-color 0.2s ease",
                    cursor: "default",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", marginBottom: "0.4rem" }}>
                    <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>{a.emoji}</span>
                    <span
                      style={{
                        fontFamily: FONT_DISPLAY,
                        fontSize: "clamp(1.15rem, 2.2vw, 1.4rem)",
                        color: "#fff",
                        letterSpacing: "0.05em",
                        lineHeight: 1,
                      }}
                    >
                      {a.event}
                    </span>
                    <span
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: "0.68rem",
                        color: BLUE,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                      }}
                    >
                      {a.result}
                    </span>
                  </div>
                  <p
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: "0.7rem",
                      color: "rgba(255,255,255,0.38)",
                      letterSpacing: "0.06em",
                      paddingLeft: "1.85rem",
                    }}
                  >
                    {a.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right: terminal profile card */}
          <div style={{ flex: "1", minWidth: "260px" }}>
            <div
              onMouseEnter={() => setProfileHovered(true)}
              onMouseLeave={() => setProfileHovered(false)}
              style={{
                background: "#04040c",
                border: `1px solid ${profileHovered ? "rgba(59,130,246,0.5)" : "rgba(59,130,246,0.2)"}`,
                borderRadius: "4px",
                padding: "1.75rem",
                fontFamily: FONT_MONO,
                transition: "border-color 0.2s ease",
              }}
            >
              {/* Terminal header */}
              <div
                style={{
                  color: BLUE,
                  fontSize: "0.82rem",
                  letterSpacing: "0.12em",
                  marginBottom: "1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span style={{ opacity: 0.7 }}>&gt;_</span>
                <span>PROFILE</span>
              </div>

              <div
                style={{
                  height: "1px",
                  background: "rgba(59,130,246,0.18)",
                  marginBottom: "1.5rem",
                }}
              />

              {[
                ["platform", "codeforces"],
                ["focus", "algorithms & data structures"],
                ["active since", "2021"],
              ].map(([key, val]) => (
                <div
                  key={key}
                  style={{
                    display: "flex",
                    gap: "1.5rem",
                    marginBottom: "0.75rem",
                    alignItems: "baseline",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.68rem",
                      color: "rgba(255,255,255,0.3)",
                      minWidth: "6rem",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {key}
                  </span>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      color: "rgba(255,255,255,0.72)",
                      letterSpacing: "0.03em",
                    }}
                  >
                    {val}
                  </span>
                </div>
              ))}

              <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", margin: "1.25rem 0" }} />

              <a
                href="https://codeforces.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.72rem",
                  color: BLUE,
                  letterSpacing: "0.06em",
                  textDecoration: "none",
                  transition: "opacity 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                <span>→</span>
                <span>view codeforces profile</span>
              </a>
            </div>
          </div>
        </div>

        {/* Quote */}
      </div>
    </section>
  );
}
