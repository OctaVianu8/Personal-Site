import { useFadeIn } from "./useFadeIn";
import styles from "./CompetitiveProgramming.module.css";

const ACHIEVEMENTS = [
  {
    emoji: "✍️",
    event: "CEOI 2025",
    result: "Problem Setter",
    desc: "Central European Olympiad in Informatics",
  },
  {
    emoji: "🥉",
    event: "RCPC 2025",
    result: "4th Place, Bronze Medal",
    desc: "Romanian Collegiate Programming Contest, Bucharest",
  },
  {
    emoji: "🥇",
    event: "ONI 2024",
    result: "3rd Prize, Gold Medal",
    desc: "National Informatics Olympiad, Bucharest",
  },
  {
    emoji: "🥉",
    event: "RCPC 2024",
    result: "4th Place, Bronze Medal",
    desc: "Romanian Collegiate Programming Contest, Bucharest",
  },
  {
    emoji: "🥈",
    event: "ONI 2023",
    result: "Honorable Mention, Silver Medal",
    desc: "National Informatics Olympiad, Bucharest",
  },
  {
    emoji: "🥈",
    event: "National Physics Olympiad 2023",
    result: "National Team Qualification, Silver Medal",
    desc: "National Physics Olympiad, Oradea",
  },
  {
    emoji: "🥈",
    event: "ONI 2022",
    result: "Silver Medal",
    desc: "National Informatics Olympiad",
  },
  {
    emoji: "🏅",
    event: "Mathematics",
    result: "1 Silver, 2 Bronze Medals",
    desc: "National Mathematics Olympiad",
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
        <h2 className={styles.heading}>Honors and Awards</h2>

        <div className={styles.featured}>
          <span className={styles.featuredEmoji}>{ACHIEVEMENTS[0].emoji}</span>
          <div className={styles.featuredTop}>
            <h3 className={styles.featuredEvent}>{ACHIEVEMENTS[0].event}</h3>
            <span className={styles.featuredResult}>{ACHIEVEMENTS[0].result}</span>
          </div>
          <p className={styles.featuredDesc}>{ACHIEVEMENTS[0].desc}</p>
        </div>

        <div className={styles.scrollContainer}>
          {ACHIEVEMENTS.slice(1).map((a, i) => (
            <div key={i} className={styles.achievementCard}>
              <div className={styles.achievementHeader}>
                <div className={styles.achievementTitleWrapper}>
                  <span className={styles.achievementEmoji}>{a.emoji}</span>
                  <span className={styles.achievementEvent}>{a.event}</span>
                </div>
                <span className={styles.achievementResult}>{a.result}</span>
              </div>
              <p className={styles.achievementDesc}>{a.desc}</p>
            </div>
          ))}
        </div>

        <div className={styles.terminalContainer}>
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
              href="https://codeforces.com/profile/Stanescu_Octav"
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
    </section>
  );
}
