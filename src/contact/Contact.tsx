import { useFadeIn } from "../useFadeIn";
import styles from "./Contact.module.css";
import ThemeSwitcher from "../components/ThemeSwitcher";

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
  { label: "Email", href: "mailto:stanescu.matei.octavian@gmail.com", Icon: EmailIcon },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/octavianu/", Icon: LinkedInIcon },
  { label: "GitHub", href: "https://github.com/OctaVianu8", Icon: GitHubIcon },
] as const;

export default function Contact() {
  const { ref, visible } = useFadeIn(0.15);

  return (
    <section id="contact" className={styles.section}>
      <div ref={ref} className={`${styles.content}${visible ? ` ${styles.visible}` : ""}`}>
        <h2 className={styles.heading}>CONTACT</h2>
        <p className={styles.subheading}>get in touch</p>

        <div className={styles.links}>
          {LINKS.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("mailto") ? undefined : "_blank"}
              rel={href.startsWith("mailto") ? undefined : "noopener noreferrer"}
              className={styles.link}
            >
              <Icon />
              <span className={styles.linkLabel}>{label}</span>
            </a>
          ))}
        </div>

        <hr className={styles.divider} />

        <ThemeSwitcher />
        <p className={styles.footer}>
          © 2025 Octavian Stănescu — Built with React + Vite, deployed on Cloudflare Pages
        </p>
      </div>
      
    </section>
  );
}
