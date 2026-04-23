import { useFadeIn } from "./useFadeIn";
import styles from "./Experience.module.css";

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

export default function Experience() {
  const { ref, visible } = useFadeIn(0.12);

  return (
    <section id="experience" className={styles.section}>
      <div ref={ref} className={`${styles.content}${visible ? ` ${styles.visible}` : ""}`}>
        <h2 className={styles.heading}>EXPERIENCE</h2>

        <div className={styles.timeline}>
          <div className={styles.line} />
          {ENTRIES.map((entry, i) => (
            <div key={i} className={styles.entry}>
              <div className={styles.dot} />
              <h3 className={styles.role}>{entry.role}</h3>
              <p className={styles.meta}>
                {entry.org}&nbsp;&nbsp;·&nbsp;&nbsp;{entry.year}
              </p>
              <p className={styles.desc}>{entry.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
