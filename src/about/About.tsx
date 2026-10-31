import { useFadeIn } from "../useFadeIn";
import { useSiteContent } from "../content/ContentProvider";
import styles from "./About.module.css";

export default function About() {
  const { ref, visible } = useFadeIn(0.12);
  const { paragraphs } = useSiteContent("about");

  return (
    <section id="about" className={styles.section}>
      <div ref={ref} className={`${styles.content}${visible ? ` ${styles.visible}` : ""}`}>
        <div className={styles.aboutGrid}>
          <div className={styles.textContent}>
            <h2 className="sectionHeading">ABOUT</h2>
            <div className={styles.textBlock}>
              {paragraphs?.map((text, i) => (
                <p key={i} className={styles.body}>{text}</p>
              ))}
            </div>
          </div>

          <div className={styles.imageSection}>
            <div className={styles.flipWrapper}>
              <div className={styles.flipInner}>
                <div className={styles.flipFront}>
                  <img src="/me1.jpg" alt="Octavian" />
                </div>
                <div className={styles.flipBack}>
                  <img src="/me2.jpg" alt="Octavian 2" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <hr className={styles.divider} />
      </div>
    </section>
  );
}
