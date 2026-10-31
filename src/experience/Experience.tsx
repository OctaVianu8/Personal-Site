import { useFadeIn } from "../useFadeIn";
import { useSiteContent } from "../content/ContentProvider";
import styles from "./Experience.module.css";

export default function Experience() {
  const { ref, visible } = useFadeIn(0.12);
  const { entries } = useSiteContent("experience");

  return (
    <section id="experience" className={styles.section}>
      <div ref={ref} className={`${styles.content}${visible ? ` ${styles.visible}` : ""}`}>
        <h2 className="sectionHeading">EXPERIENCE</h2>

        <div className={styles.timeline}>
          <div className={styles.line} />
          {entries?.map((entry, i) => (
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
