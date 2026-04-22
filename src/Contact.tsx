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
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
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

const EmailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <polyline points="2,4 12,13 22,4" />
  </svg>
);

const LinkedInIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="2" />
    <line x1="8" y1="11" x2="8" y2="16" />
    <line x1="8" y1="8" x2="8" y2="8.5" />
    <path d="M12 16v-4a2 2 0 0 1 4 0v4" />
    <line x1="12" y1="12" x2="12" y2="16" />
  </svg>
);

const GitHubIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const LINKS = [
  {
    label: "Email",
    href: "mailto:stanescu.matei.octavian@gmail.com",
    Icon: EmailIcon,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/octavianu/",
    Icon: LinkedInIcon,
  },
  {
    label: "GitHub",
    href: "https://github.com/OctaVianu8",
    Icon: GitHubIcon,
  },
] as const;

export default function Contact() {
  const { ref, fadeStyle } = useFadeIn();
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section id="contact" style={{ background: BG }}>
      <div
        ref={ref}
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          padding: "6rem 2.5rem 5rem",
          textAlign: "center",
          ...fadeStyle,
        }}
      >
        <h2
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: "clamp(2.2rem, 4vw, 3rem)",
            color: "#fff",
            letterSpacing: "0.06em",
            marginBottom: "0.75rem",
          }}
        >
          CONTACT
        </h2>

        <p
          style={{
            fontFamily: FONT_MONO,
            fontSize: "0.75rem",
            color: "rgba(255,255,255,0.35)",
            letterSpacing: "0.06em",
            marginBottom: "3.5rem",
          }}
        >
          get in touch
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "3rem",
            flexWrap: "wrap",
            marginBottom: "5rem",
          }}
        >
          {LINKS.map(({ label, href, Icon }, i) => {
            const isHovered = hovered === i;
            return (
              <a
                key={label}
                href={href}
                target={href.startsWith("mailto") ? undefined : "_blank"}
                rel={href.startsWith("mailto") ? undefined : "noopener noreferrer"}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.6rem",
                  color: isHovered ? BLUE : "rgba(255,255,255,0.5)",
                  textDecoration: "none",
                  transition: "color 0.2s ease",
                }}
              >
                <Icon />
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: "0.68rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  {label}
                </span>
              </a>
            );
          })}
        </div>

        <hr
          style={{
            border: "none",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            marginBottom: "1.75rem",
          }}
        />

        <p
          style={{
            fontFamily: FONT_MONO,
            fontSize: "0.65rem",
            color: "rgba(255,255,255,0.22)",
            letterSpacing: "0.06em",
            lineHeight: "1.8",
          }}
        >
          © 2025 Octavian Stănescu — Built with React + Vite, deployed on Cloudflare Pages
        </p>
      </div>
    </section>
  );
}
