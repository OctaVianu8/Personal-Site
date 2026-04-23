import { useFadeIn } from "./useFadeIn";
import styles from "./About.module.css";

export default function About() {
  const { ref, visible } = useFadeIn(0.12);

  return (
    <section id="about" className={styles.section}>
      <div ref={ref} className={`${styles.content}${visible ? ` ${styles.visible}` : ""}`}>
        <h2 className={styles.heading}>ABOUT</h2>

        <div className={styles.textBlock}>
          <p className={styles.body}>
            I'm a CS student at UPB Bucharest, competitive programmer, and incoming
            intern. I placed Gold at ONI 2024 (Romanian National Informatics Olympiad)
            and serve as a problem setter for CEOI (Central European Olympiad in
            Informatics). I was selected for the Citadel Discover program. I care about
            algorithms, systems, and building things that work.
          </p>
        </div>

        <hr className={styles.divider} />
      </div>
    </section>
  );
}
