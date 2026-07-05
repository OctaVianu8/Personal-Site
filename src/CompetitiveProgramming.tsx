import { useFadeIn } from "./useFadeIn";
import styles from "./CompetitiveProgramming.module.css";

type IconProps = {
  className?: string;
};

function PenLineIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function MedalIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.61 2.14a2 2 0 0 1 .13 2.2L16.79 15" />
      <path d="M11 12 5.12 2.2" />
      <path d="m13 12 5.88-9.8" />
      <circle cx="12" cy="17" r="5" />
      <path d="M12 18v-2h-.5" />
    </svg>
  );
}

function TrophyIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21h10a5 5 0 0 0-2.024-3.018A2 2 0 0 1 14 16.286V14.66" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z" />
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    </svg>
  );
}

function AwardIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  );
}

const ACHIEVEMENTS = [
  {
    Icon: PenLineIcon,
    event: "CEOI 2025",
    result: "Problem Setter",
    desc: "Central European Olympiad in Informatics",
  },
  {
    Icon: MedalIcon,
    event: "RCPC 2025",
    result: "4th Place, Bronze Medal",
    desc: "Romanian Collegiate Programming Contest, Bucharest",
  },
  {
    Icon: TrophyIcon,
    event: "ONI 2024",
    result: "3rd Prize, Gold Medal",
    desc: "National Informatics Olympiad, Bucharest",
  },
  {
    Icon: MedalIcon,
    event: "RCPC 2024",
    result: "4th Place, Bronze Medal",
    desc: "Romanian Collegiate Programming Contest, Bucharest",
  },
  {
    Icon: AwardIcon,
    event: "ONI 2023",
    result: "Honorable Mention, Silver Medal",
    desc: "National Informatics Olympiad, Bucharest",
  },
  {
    Icon: AwardIcon,
    event: "National Physics Olympiad 2023",
    result: "National Team Qualification, Silver Medal",
    desc: "National Physics Olympiad, Oradea",
  },
  {
    Icon: AwardIcon,
    event: "ONI 2022",
    result: "Silver Medal",
    desc: "National Informatics Olympiad",
  },
  {
    Icon: MedalIcon,
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
  const FeaturedIcon = ACHIEVEMENTS[0].Icon;

  return (
    <section id="competitive-programming" className={styles.section}>
      <div ref={ref} className={`${styles.content}${visible ? ` ${styles.visible}` : ""}`}>
        <h2 className={styles.heading}>Honors and Awards</h2>

        <div className={styles.featured}>
          <span className={styles.featuredIcon}>
            <FeaturedIcon className={styles.awardIcon} />
          </span>
          <div className={styles.featuredTop}>
            <h3 className={styles.featuredEvent}>{ACHIEVEMENTS[0].event}</h3>
            <span className={styles.featuredResult}>{ACHIEVEMENTS[0].result}</span>
          </div>
          <p className={styles.featuredDesc}>{ACHIEVEMENTS[0].desc}</p>
        </div>

        <div className={styles.scrollContainer}>
          {ACHIEVEMENTS.slice(1).map((a, i) => {
            const Icon = a.Icon;
            return (
              <div key={i} className={styles.achievementCard}>
                <div className={styles.achievementHeader}>
                  <div className={styles.achievementTitleWrapper}>
                    <span className={styles.achievementIcon}>
                      <Icon className={styles.awardIcon} />
                    </span>
                    <span className={styles.achievementEvent}>{a.event}</span>
                  </div>
                  <span className={styles.achievementResult}>{a.result}</span>
                </div>
                <p className={styles.achievementDesc}>{a.desc}</p>
              </div>
            );
          })}
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
