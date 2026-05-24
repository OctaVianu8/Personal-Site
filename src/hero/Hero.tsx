import styles from "./Hero.module.css";

const STATS = [
  { value: "Gold", label: "ONI 2024" },
  { value: "CEOI", label: "Problem Setter" },
  { value: "Citadel", label: "Discover" },
  { value: "AMIQ Eda", label: "Software Engineering Intern" },
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
      </a>
      <a
        href="/CV.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.btnSecondary}
      >
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
