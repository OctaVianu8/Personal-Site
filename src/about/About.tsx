import { useFadeIn } from "../useFadeIn";
import styles from "./About.module.css";

export default function About() {
  const { ref, visible } = useFadeIn(0.12);

  return (
    <section id="about" className={styles.section}>
      <div ref={ref} className={`${styles.content}${visible ? ` ${styles.visible}` : ""}`}>
        <div className={styles.aboutGrid}>
          <div className={styles.textContent}>
            <h2 className="sectionHeading">ABOUT</h2>
            <div className={styles.textBlock}>
              <p className={styles.body}>
                I'm a CS student at UPB Bucharest, competitive programmer, and SWE
                intern at AMIQ EDA. I placed Bronze at RCPC 2025 and 2024 (Romanian Collegiate Programming Contest) and Gold at ONI 2024 (National CS Olympiad). I also
                served as a problem setter for CEOI (Central European Olympiad in
                Informatics). I was selected for the Discover Citadel program.
              </p>
              <p className={styles.body}>
                I have a strong interest in competitive programming, algorithms, and
                software engineering. I enjoy solving challenging problems and learning
                new things. I am always looking for opportunities to improve my skills
                and contribute to interesting projects.
              </p>
              <p className={styles.body}>
                In my free time, I enjoy photography, hiking, and exploring new places. I
                also like to read about technology, science, and psychology.
              </p>
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
