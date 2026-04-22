import { useEffect, useRef, useState } from "react";

const BG = "#050508";
const BLUE = "#3b82f6";
const FONT_DISPLAY = "'Bebas Neue', sans-serif";
const FONT_MONO = "'Space Mono', monospace";

const PROJECTS = [
  {
    name: "DraWar",
    desc: "Real-time multiplayer drawing game. WebSocket server, custom-trained CNN for drawing recognition.",
    tags: ["React", "Python", "WebSocket", "CNN"],
    stealth: false,
  },
  {
    name: "Router",
    lang: "(C)",
    desc: "IPv4 router with LPM forwarding, TTL management, ICMP generation, and checksum validation.",
    tags: ["C", "Networking", "Systems"],
    stealth: false,
  },
  {
    name: "Network Protocol",
    desc: "Client-server banking protocol with CRC32 checksums and ACK/NACK retransmission.",
    tags: ["C", "Sockets", "Protocols"],
    stealth: false,
  },
  {
    name: "Something new",
    desc: "Building in stealth.",
    tags: [],
    stealth: true,
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

export default function Projects() {
  const { ref, fadeStyle } = useFadeIn();
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section id="projects" style={{ background: BG }}>
      <style>{`@media (max-width: 640px) { .projects-grid { grid-template-columns: 1fr !important; } }`}</style>

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
          PROJECTS
        </h2>

        <div
          className="projects-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "1.25rem",
          }}
        >
          {PROJECTS.map((project, i) => {
            const isHovered = hovered === i;
            return (
              <div
                key={i}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: "#07070f",
                  borderWidth: "1px",
                  borderStyle: project.stealth ? "dashed" : "solid",
                  borderColor: isHovered
                    ? BLUE
                    : project.stealth
                    ? "rgba(255,255,255,0.1)"
                    : "#1a1a2e",
                  borderRadius: "4px",
                  padding: "1.75rem",
                  transition: "border-color 0.2s ease, transform 0.2s ease",
                  transform: isHovered ? "translateY(-4px)" : "translateY(0)",
                  cursor: "default",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.9rem",
                }}
              >
                <h3
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontSize: "clamp(1.3rem, 2.5vw, 1.6rem)",
                    color: project.stealth ? "rgba(255,255,255,0.3)" : "#fff",
                    letterSpacing: "0.05em",
                    lineHeight: 1,
                  }}
                >
                  {"lang" in project
                    ? `${project.name} `
                    : project.name}
                  {"lang" in project && (
                    <span
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: "0.7rem",
                        color: "rgba(255,255,255,0.3)",
                        letterSpacing: "0.08em",
                        verticalAlign: "middle",
                      }}
                    >
                      {project.lang}
                    </span>
                  )}
                </h3>

                <p
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: "0.75rem",
                    color: project.stealth
                      ? "rgba(255,255,255,0.28)"
                      : "rgba(255,255,255,0.6)",
                    lineHeight: "1.8",
                    letterSpacing: "0.01em",
                    flex: 1,
                    fontStyle: project.stealth ? "italic" : "normal",
                  }}
                >
                  {project.desc}
                </p>

                {project.tags.length > 0 && (
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontFamily: FONT_MONO,
                          fontSize: "0.62rem",
                          letterSpacing: "0.06em",
                          color: BLUE,
                          background: "rgba(59,130,246,0.1)",
                          padding: "0.2rem 0.55rem",
                          borderRadius: "2px",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
