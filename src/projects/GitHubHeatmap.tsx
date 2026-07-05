import { useState, useEffect, useMemo } from "react";
import { useFadeIn } from "../useFadeIn";
import styles from "./GitHubHeatmap.module.css";

interface ContributionDay {
  date: string;
  level: number;
  count: number;
}

interface ContributionData {
  total: number;
  days: ContributionDay[];
}

interface MonthActivity {
  month: string;
  commits: { fullName: string; commits: number }[];
  totalCommits: number;
  createdRepos: { fullName: string; language: string | null }[];
}

interface ActivityData {
  activities: MonthActivity[];
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function buildWeeksFromDays(days: ContributionDay[]): ContributionDay[][] {
  if (days.length === 0) return [];

  const sorted = [...days].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const weeks: ContributionDay[][] = [];
  let currentWeek: ContributionDay[] = [];

  for (const day of sorted) {
    const d = new Date(day.date + "T00:00:00");
    const dow = d.getDay();

    if (dow === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }

    currentWeek.push(day);
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return weeks;
}

export default function GitHubHeatmap() {
  const { ref, visible } = useFadeIn(0.08);

  const [contribData, setContribData] = useState<ContributionData | null>(null);
  const [activityData, setActivityData] = useState<ActivityData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [contribRes, activityRes] = await Promise.all([
        fetch("/api/github-contributions"),
        fetch("/api/github-activity"),
      ]);

      if (contribRes.ok) {
        setContribData(await contribRes.json());
      } else {
        throw new Error("Contribution proxy returned " + contribRes.status);
      }

      if (activityRes.ok) {
        setActivityData(await activityRes.json());
      } else {
        console.warn("Activity proxy failed:", activityRes.status);
      }
    } catch (err) {
      console.error("Failed to load contribution data");
      setError("Could not load contribution data.");
    } finally {
      setLoading(false);
    }
  }

  const weeks = useMemo(
    () => (contribData ? buildWeeksFromDays(contribData.days) : []),
    [contribData]
  );

  const totalContributions = contribData?.total ?? 0;
  const monthlyActivity = activityData?.activities ?? [];

  const monthLabels = useMemo(() => {
    const labels: { label: string; col: number }[] = [];
    let lastMonth = -1;
    for (let w = 0; w < weeks.length; w++) {
      const firstDay = weeks[w][0];
      if (!firstDay) continue;
      const d = new Date(firstDay.date + "T00:00:00");
      const m = d.getMonth();
      if (m !== lastMonth) {
        labels.push({ label: MONTH_NAMES[m], col: w });
        lastMonth = m;
      }
    }
    return labels;
  }, [weeks]);

  if (loading) {
    return (
      <section className={styles.section}>
        <div ref={ref} className={`${styles.content}${visible ? ` ${styles.visible}` : ""}`}>
          <div className={styles.header}>
            <h2 className="sectionHeading sectionHeadingFlush">Contributions</h2>
          </div>
          <div className={styles.heatmapWrapper}>
            <div className={`${styles.loadingText} ${styles.skeleton}`}>
              Loading contribution data...
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.section}>
        <div ref={ref} className={`${styles.content}${visible ? ` ${styles.visible}` : ""}`}>
          <div className={styles.header}>
            <h2 className="sectionHeading sectionHeadingFlush">Contributions</h2>
          </div>
          <p className={styles.errorText}>{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section id="contributions" className={styles.section}>
      <div ref={ref} className={`${styles.content}${visible ? ` ${styles.visible}` : ""}`}>
        <div className={styles.header}>
          <h2 className="sectionHeading sectionHeadingFlush">Contributions</h2>
          <span className={styles.totalCount}>
            {totalContributions} contributions in the last year
          </span>
        </div>

        <div className={styles.heatmapWrapper}>
          <div className={styles.heatmapScroll}>
            <div className={styles.monthRow}>
              {monthLabels.map((ml, i) => {
                const nextCol = i < monthLabels.length - 1 ? monthLabels[i + 1].col : weeks.length;
                const span = nextCol - ml.col;
                return (
                  <span
                    key={ml.label + ml.col}
                    className={styles.monthLabel}
                    style={{ width: `${span * 16}px` }}
                  >
                    {ml.label}
                  </span>
                );
              })}
            </div>

            <div className={styles.gridArea}>
              <div className={styles.dayLabels}>
                <span className={styles.dayLabel}></span>
                <span className={styles.dayLabel}>Mon</span>
                <span className={styles.dayLabel}></span>
                <span className={styles.dayLabel}>Wed</span>
                <span className={styles.dayLabel}></span>
                <span className={styles.dayLabel}>Fri</span>
                <span className={styles.dayLabel}></span>
              </div>

              <div className={styles.grid}>
                {weeks.flatMap((week) =>
                  week.map((day) => {
                    const d = new Date(day.date + "T00:00:00");
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    if (d > today) {
                      return (
                        <div
                          key={day.date}
                          className={styles.cell}
                          style={{ visibility: "hidden" }}
                        />
                      );
                    }
                    const tooltip = day.count > 0
                      ? `${day.count} contribution${day.count !== 1 ? "s" : ""} on ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
                      : `No contributions on ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
                    return (
                      <div
                        key={day.date}
                        className={`${styles.cell} ${styles[`level${day.level}`]}`}
                        data-tooltip={tooltip}
                      />
                    );
                  })
                )}
              </div>
            </div>

            <div className={styles.footer}>
              <span className={styles.footerLabel}>Less</span>
              {[0, 1, 2, 3, 4].map((lvl) => (
                <div
                  key={lvl}
                  className={`${styles.legendCell} ${styles[`level${lvl}`]}`}
                />
              ))}
              <span className={styles.footerLabel}>More</span>
            </div>
          </div>
        </div>

        <button
          className={styles.expandBtn}
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
        >
          <span
            className={`${styles.expandArrow} ${expanded ? styles.expandArrowOpen : ""}`}
          >
            ▼
          </span>
          {expanded ? "Collapse activity" : "Expand activity"}
        </button>

        <div className={`${styles.activity} ${expanded ? styles.activityOpen : ""}`}>
          {monthlyActivity.map((ma) => (
            <div key={ma.month} className={styles.monthSection}>
              <h3 className={styles.monthHeading}>{ma.month.toUpperCase()}</h3>

              {ma.commits.length > 0 && (
                <div className={styles.activityCard}>
                  <div className={styles.activityCardHeader}>
                    <div className={styles.activityIcon}>
                      <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1.643 3.143L.427 1.927A.25.25 0 01.604 1.5H2.75c.138 0 .25.112.25.25v2.146a.25.25 0 01-.427.177L1.643 3.143zM8 1a7 7 0 110 14A7 7 0 018 1zm.75 4.75a.75.75 0 00-1.5 0v2.5c0 .414.336.75.75.75h2.5a.75.75 0 000-1.5H8.75V5.75z" />
                      </svg>
                    </div>
                    <span className={styles.activityTitle}>
                      Created{" "}
                      <span className={styles.activityTitleBold}>
                        {ma.totalCommits} commit{ma.totalCommits !== 1 ? "s" : ""}
                      </span>{" "}
                      in {ma.commits.length} repositor{ma.commits.length !== 1 ? "ies" : "y"}
                    </span>
                  </div>

                  {ma.commits.map((repo) => {
                    const maxCommits = ma.commits[0]?.commits ?? 1;
                    const pct = Math.max(5, (repo.commits / maxCommits) * 100);
                    const owner = repo.fullName.split('/')[0];
                    const name = repo.fullName.split('/')[1] ?? repo.fullName;
                    const url = `https://github.com/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`;
                    
                    return (
                      <div key={repo.fullName} className={styles.repoRow}>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.repoLink}
                        >
                          {repo.fullName}
                        </a>
                        <span className={styles.repoCommits}>
                          {repo.commits} commit{repo.commits !== 1 ? "s" : ""}
                        </span>
                        <div className={styles.progressWrapper}>
                          <div
                            className={styles.progressBar}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {ma.createdRepos.length > 0 && (
                <div className={styles.activityCard}>
                  <div className={styles.activityCardHeader}>
                    <div className={styles.activityIcon}>
                      <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z" />
                      </svg>
                    </div>
                    <span className={styles.activityTitle}>
                      Created{" "}
                      <span className={styles.activityTitleBold}>
                        {ma.createdRepos.length} repositor{ma.createdRepos.length !== 1 ? "ies" : "y"}
                      </span>
                    </span>
                  </div>

                  {ma.createdRepos.map((repo) => {
                    const owner = repo.fullName.split('/')[0];
                    const name = repo.fullName.split('/')[1] ?? repo.fullName;
                    const url = `https://github.com/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`;
                    
                    return (
                      <div key={repo.fullName} className={styles.repoRow} style={{ paddingBottom: '0.5rem' }}>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.repoLink}
                        >
                          {repo.fullName}
                        </a>
                        {repo.language && (
                          <span className={styles.repoCommits} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-accent)', display: 'inline-block' }}></span>
                            {repo.language}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {monthlyActivity.length === 0 && (
            <p className={styles.loadingText}>No recent activity found.</p>
          )}
        </div>
      </div>
    </section>
  );
}
