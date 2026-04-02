import { useState, useEffect } from "react";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={scrolled ? `${styles.navbar} ${styles.scrolled}` : styles.navbar}>
      <span className={styles.logo}>OS</span>

      <div className={styles.links}>
        {["About", "Projects", "CP"].map((item) => (
          <a key={item} href={`#${item.toLowerCase()}`} className={styles.link}>
            {item}
          </a>
        ))}
        <a
          href="/CV.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.cv}
        >
          CV
        </a>
      </div>
    </nav>
  );
}
