import { useFadeIn } from "./useFadeIn";
import styles from "./CompetitiveProgramming.module.css";

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

const TERMINAL_ROWS = [
  ["platform", "codeforces"],
  ["focus", "algorithms & data structures"],
  ["active since", "2021"],
] as const;

export default function CompetitiveProgramming() {
  const { ref, visible } = useFadeIn(0.08);

  return (
    <section id="competitive-programming" className={styles.section}>
      <div ref={ref} className={`${styles.content}${visible ? ` ${styles.visible}` : ""}`}>
        <h2 className={styles.heading}>COMPETITIVE PROGRAMMING</h2>

        <div className={styles.columns}>
          <div className={styles.leftCol}>
            {ACHIEVEMENTS.map((a, i) => (
              <div key={i} className={styles.achievementCard}>
                <div className={styles.achievementHeader}>
                  <span className={styles.achievementEmoji}>{a.emoji}</span>
                  <span className={styles.achievementEvent}>{a.event}</span>
                  <span className={styles.achievementResult}>{a.result}</span>
                </div>
                <p className={styles.achievementDesc}>{a.desc}</p>
              </div>
            ))}
          </div>

          <div className={styles.rightCol}>
            <div className={styles.terminal}>
              <div className={styles.terminalHeader}>
                <span className={styles.terminalPrompt}>&gt;_</span>
                <span>PROFILE</span>
              </div>
              <div className={styles.terminalDivider} />
              {TERMINAL_ROWS.map(([key, val]) => (
                <div key={key} className={styles.terminalRow}>
                  <span className={styles.terminalKey}>{key}</span>
                  <span className={styles.terminalVal}>{val}</span>
                </div>
              ))}
              <div className={styles.terminalMidRule} />
              <a
                href="https://codeforces.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.profileLink}
              >
                <span>→</span>
                <span>view codeforces profile</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
