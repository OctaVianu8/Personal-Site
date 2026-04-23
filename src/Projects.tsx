import { useFadeIn } from "./useFadeIn";
import styles from "./Projects.module.css";

const PROJECTS = [
  {
    name: "DraWar",
    desc: "Real-time multiplayer drawing game. WebSocket server, custom-trained CNN for drawing recognition.",
    tags: ["React", "Python", "WebSocket", "CNN"],
    stealth: false,
  },
  {
    name: "Router",
    lang: "(C)",
    desc: "IPv4 router with LPM forwarding, TTL management, ICMP generation, and checksum validation.",
    tags: ["C", "Networking", "Systems"],
    stealth: false,
  },
  {
    name: "Digit Recognition Neural Network",
    lang: "(MATLAB)",
    desc: "Forward and back propagation on a 400-25-10 network, without high-level ML libraries, using Conjugate Gradient optimization.",
    tags: ["MATLAB", "Machine Learning", "Neural Networks"],
    stealth: false,
  },
  {
    name: "Something new",
    desc: "Building in stealth.",
    tags: [] as string[],
    stealth: true,
  },
] as const;

export default function Projects() {
  const { ref, visible } = useFadeIn(0.08);

  return (
    <section id="projects" className={styles.section}>
      <div ref={ref} className={`${styles.content}${visible ? ` ${styles.visible}` : ""}`}>
        <h2 className={styles.heading}>PROJECTS</h2>

        <div className={styles.grid}>
          {PROJECTS.map((project, i) => (
            <div
              key={i}
              className={`${styles.card}${project.stealth ? ` ${styles.cardStealth}` : ""}`}
            >
              <h3 className={`${styles.cardTitle}${project.stealth ? ` ${styles.cardTitleMuted}` : ""}`}>
                {"lang" in project ? `${project.name} ` : project.name}
                {"lang" in project && (
                  <span className={styles.langBadge}>{project.lang}</span>
                )}
              </h3>

              <p className={`${styles.cardDesc}${project.stealth ? ` ${styles.cardDescMuted}` : ""}`}>
                {project.desc}
              </p>

              {project.tags.length > 0 && (
                <div className={styles.tags}>
                  {project.tags.map((tag) => (
                    <span key={tag} className={styles.tag}>{tag}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
