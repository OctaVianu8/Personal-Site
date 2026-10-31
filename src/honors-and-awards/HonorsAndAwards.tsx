import type { ReactElement } from "react";
import { useFadeIn } from "../useFadeIn";
import { useSiteContent } from "../content/ContentProvider";
import type { AwardItem } from "../content/defaults";
import styles from "./HonorsAndAwards.module.css";

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

const ICON_MAP: Record<AwardItem["icon"], (props: IconProps) => ReactElement> = {
  pen: PenLineIcon,
  medal: MedalIcon,
  trophy: TrophyIcon,
  award: AwardIcon,
};

export default function HonorsAndAwards() {
  const { ref, visible } = useFadeIn(0.08);
  const { items } = useSiteContent("awards");
  const validItems = items ?? [];
  const FeaturedIcon = ICON_MAP[validItems[0]?.icon ?? "award"] ?? AwardIcon;

  return (
    <section id="honors-and-awards" className={styles.section}>
      <div ref={ref} className={`${styles.content}${visible ? ` ${styles.visible}` : ""}`}>
        <h2 className="sectionHeading">Honors and Awards</h2>

        {validItems.length > 0 && (
          <div className={styles.featured}>
            <span className={styles.featuredIcon}>
              <FeaturedIcon className={styles.awardIcon} />
            </span>
            <div className={styles.featuredTop}>
              <h3 className={styles.featuredEvent}>{validItems[0].event}</h3>
              <span className={styles.featuredResult}>{validItems[0].result}</span>
            </div>
            <p className={styles.featuredDesc}>{validItems[0].desc}</p>
          </div>
        )}

        <div className={styles.scrollContainer}>
          {validItems.slice(1).map((a, i) => {
            const Icon = ICON_MAP[a.icon ?? "award"] ?? AwardIcon;
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

      </div>
    </section>
  );
}
