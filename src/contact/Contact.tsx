import { useFadeIn } from "../useFadeIn";
import { useSiteContent } from "../content/ContentProvider";
import styles from "./Contact.module.css";

type IconProps = {
  className?: string;
};

const EmailIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <polyline points="2,4 12,13 22,4" />
  </svg>
);

const LinkedInIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="2" />
    <line x1="8" y1="11" x2="8" y2="16" />
    <line x1="8" y1="8" x2="8" y2="8.5" />
    <path d="M12 16v-4a2 2 0 0 1 4 0v4" />
    <line x1="12" y1="12" x2="12" y2="16" />
  </svg>
);

const GitHubIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const ExternalLinkIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M15 3h6v6" />
    <path d="M10 14 21 3" />
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </svg>
);

const getLinkIcon = (label: string) => {
  const l = (label || "").toLowerCase();
  if (l.includes("mail")) return EmailIcon;
  if (l.includes("linkedin")) return LinkedInIcon;
  if (l.includes("github")) return GitHubIcon;
  return ExternalLinkIcon;
};

export default function Contact() {
  const { ref, visible } = useFadeIn(0.15);
  const { links, footer } = useSiteContent("contact");

  return (
    <section id="contact" className={styles.section}>
      <div ref={ref} className={`${styles.content}${visible ? ` ${styles.visible}` : ""}`}>
        <h2 className="sectionHeading sectionHeadingCompact">CONTACT</h2>
        <p className={styles.subheading}>get in touch</p>

        <div className={styles.links}>
          {links?.map(({ label, href }, i) => {
            const Icon = getLinkIcon(label);
            return (
              <a
                key={`${label}-${i}`}
                href={href}
                target={href?.startsWith("mailto") ? undefined : "_blank"}
                rel={href?.startsWith("mailto") ? undefined : "noopener noreferrer"}
                className={styles.link}
              >
                <Icon className={styles.linkIcon} />
                <span className={styles.linkLabel}>{label}</span>
                <ExternalLinkIcon className={styles.externalIcon} />
              </a>
            );
          })}
        </div>

        <hr className={styles.divider} />

        <p className={styles.footer}>
          {footer}
        </p>
      </div>
    </section>
  );
}
