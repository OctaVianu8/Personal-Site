import styles from "./Hero.module.css";

type IconProps = {
  className?: string;
};

const ChevronRightIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const DownloadIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </svg>
);

const STATS = [
  { value: "AMIQ EDA", label: "Software Engineering Intern" },
  { value: "Discover Citadel", label: "Attendee" },
  { value: "CEOI", label: "Problem Setter" },
  { value: "RCPC", label: "Bronze Medalist" },
] as const;

function HeroTitle() {
  return (
    <>
      <p className={styles.greeting}>Hello, I'm</p>
      <h1 className={styles.title}>
        Octavian
        <br />
        <span className={styles.titleAccent}>Stănescu</span>
      </h1>
      <p className={styles.subtitle}>
        Computer Science and Engineering @ ACS UPB
      </p>
    </>
  );
}

function HeroActions() {
  return (
    <div className={styles.actions}>
      <a href="#projects" className={styles.btnPrimary}>
        View Projects
        <ChevronRightIcon className={styles.btnIcon} />
      </a>
      <a
        href="/CV.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.btnSecondary}
      >
        <DownloadIcon className={styles.btnIcon} />
        Download CV
      </a>
    </div>
  );
}

function HeroStats() {
  return (
    <div className={styles.stats}>
      {STATS.map(({ value, label }) => (
        <div key={label}>
          <p className={styles.statValue}>{value}</p>
          <p className={styles.statLabel}>{label}</p>
        </div>
      ))}
    </div>
  );
}

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.glow} />
      <div className={styles.content}>
        <HeroTitle />
        <HeroActions />
        <HeroStats />
      </div>
    </section>
  );
}
